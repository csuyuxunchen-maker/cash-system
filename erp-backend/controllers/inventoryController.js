const db = require("../config/db");
const { generateGuid } = require("../utils/guidHelper");

const DENOMINATOR = 100;
// 系统本位币 (CNY) 的 GUID，用于主列表价值估算汇总
const CNY_CURRENCY_GUID = "f4b3e81a3d3e4ed8b46a7c06f8c4c7b8";

/**
 * 获取特定商品的库存水平 (用于简单查询)
 */
exports.getStockLevel = async (req, res, next) => {
  try {
    const { commodity_guid } = req.params;

    // 1. 找到所有关联的 STOCK 账户
    const acctSql = `
      SELECT guid 
      FROM accounts 
      WHERE commodity_guid = ? AND account_type = 'STOCK'
    `;
    const accounts = await db.query(acctSql, [commodity_guid]);

    if (accounts.length === 0) {
      return res
        .status(404)
        .json({ error: res.__("errors.stock_account_not_found") });
    }
    const accountGuids = accounts.map((a) => a.guid);
    const placeholders = accountGuids.map(() => "?").join(",");

    // 2. 仅汇总数量
    const splitSql = `
      SELECT 
        SUM(s.quantity_num / s.quantity_denom) AS stock_level
      FROM splits s
      WHERE s.account_guid IN (${placeholders})
    `;

    const result = await db.query(splitSql, accountGuids);
    const stock_level = result[0].stock_level || 0;

    res.json({
      commodity_guid: commodity_guid,
      stock_level: parseFloat(stock_level),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 获取商品详情 (汇总 + 流水) - 保持不变，这部分逻辑已经支持多币种展示
 */
exports.getInventoryItemDetails = async (req, res, next) => {
  try {
    const { commodity_guid } = req.params;

    // 1. 查找所有关联的 STOCK 账户
    const stockAccountsSql = `
      SELECT a.guid, a.name, p_comm.mnemonic as currency_code
      FROM accounts a
      JOIN accounts p ON a.parent_guid = p.guid
      JOIN commodities p_comm ON p.commodity_guid = p_comm.guid
      WHERE a.commodity_guid = ? 
        AND a.account_type = 'STOCK'
        AND p_comm.namespace = 'CURRENCY'
    `;
    const stockAccounts = await db.query(stockAccountsSql, [commodity_guid]);

    if (stockAccounts.length === 0) {
      return res
        .status(404)
        .json({ error: res.__("errors.stock_account_not_found") });
    }

    const accountGuids = stockAccounts.map((a) => a.guid);
    const placeholders = accountGuids.map(() => "?").join(",");

    // 2. 获取按货币汇总的明细
    const summarySql = `
      SELECT 
        s.account_guid, 
        SUM(s.quantity_num / s.quantity_denom) as total_quantity,
        SUM(s.value_num / s.value_denom) as total_value
      FROM splits s
      WHERE s.account_guid IN (${placeholders})
      GROUP BY s.account_guid
    `;
    const summaryData = await db.query(summarySql, accountGuids);

    // 3. 将汇总数据合并到账户信息中
    const summary = stockAccounts.map((account) => {
      const data =
        summaryData.find((s) => s.account_guid === account.guid) || {};
      return {
        ...account,
        total_quantity: parseFloat(data.total_quantity || 0),
        total_value: parseFloat(data.total_value || 0),
      };
    });

    // 4. 获取详细流水
    const ledgerSql = `
      SELECT 
        t.post_date,
        t.description,
        s.account_guid,
        a.name as account_name,
        s.quantity_num, s.quantity_denom,
        s.value_num, s.value_denom,
        t_comm.mnemonic as currency_code
      FROM splits s
      JOIN transactions t ON s.tx_guid = t.guid
      JOIN accounts a ON s.account_guid = a.guid
      JOIN commodities t_comm ON t.currency_guid = t_comm.guid
      WHERE s.account_guid IN (${placeholders})
      ORDER BY t.post_date DESC
    `;
    const ledger = await db.query(ledgerSql, accountGuids);

    res.json({
      summary: summary, // 这里会包含 USD, CNY, EUR 等各种货币的汇总
      ledger: ledger, // 详细流水
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 调整库存 (保持不变)
 */
exports.adjustInventory = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const {
      commodity_guid,
      currency_guid,
      adjustment_expense_account_guid,
      quantity_change,
      cost_per_unit,
      notes,
    } = req.body;

    const accSql = "SELECT commodity_guid FROM accounts WHERE guid = ?";
    const expense_acct = await db.query(accSql, [
      adjustment_expense_account_guid,
    ]);

    if (expense_acct.length === 0) {
      throw new Error(res.__("errors.account_not_found") + " (Expense)");
    }
    if (expense_acct[0].commodity_guid !== currency_guid) {
      throw new Error(
        "Expense account currency does not match transaction currency."
      );
    }

    const stockAcctSql = `
      SELECT a.guid 
      FROM accounts a
      JOIN accounts p ON a.parent_guid = p.guid
      WHERE a.commodity_guid = ? 
      AND a.account_type = 'STOCK'
      AND p.commodity_guid = ?
      LIMIT 1
    `;
    const stock_acct = await db.query(stockAcctSql, [
      commodity_guid,
      currency_guid,
    ]);

    if (stock_acct.length === 0) {
      throw new Error(
        res.__("errors.stock_account_not_found") + " for the selected currency."
      );
    }
    const stock_account_guid = stock_acct[0].guid;

    const total_value_change = quantity_change * cost_per_unit;

    await connection.beginTransaction();

    const tx_guid = generateGuid();
    const date_now_str = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const txSql = `
      INSERT INTO transactions (guid, currency_guid, num, post_date, enter_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(txSql, [
      tx_guid,
      currency_guid,
      "",
      date_now_str,
      date_now_str,
      notes || "Inventory Adjustment",
    ]);

    const splitSql = `
      INSERT INTO splits (guid, tx_guid, account_guid, memo, action, reconcile_state, value_num, value_denom, quantity_num, quantity_denom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stock_split_guid = generateGuid();
    await connection.execute(splitSql, [
      stock_split_guid,
      tx_guid,
      stock_account_guid,
      `Adjust ${quantity_change} units`,
      "Adjust",
      "n",
      Math.round(total_value_change * DENOMINATOR),
      DENOMINATOR,
      Math.round(quantity_change * DENOMINATOR),
      DENOMINATOR,
    ]);

    const expense_split_guid = generateGuid();
    await connection.execute(splitSql, [
      expense_split_guid,
      tx_guid,
      adjustment_expense_account_guid,
      `Cost of ${quantity_change} units`,
      "Adjust",
      "n",
      Math.round(-total_value_change * DENOMINATOR),
      DENOMINATOR,
      Math.round(-total_value_change * DENOMINATOR),
      DENOMINATOR,
    ]);

    await connection.commit();

    res.status(201).json({
      message: "Inventory adjusted successfully.",
      transaction_guid: tx_guid,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

/**
 * (修改) 批量获取所有商品的库存水平和价值 (主列表专用)
 * 逻辑：按[商品]分组，将所有货币价值折算为 CNY 进行估值汇总，确保一行显示一个商品。
 */
exports.getBatchStockLevels = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        c.guid, 
        c.mnemonic, 
        c.fullname,
        -- 1. 汇总所有账户的数量 (物理数量相加)
        COALESCE(SUM(s.quantity_num / s.quantity_denom), 0) AS stock_level,
        
        -- 2. 汇总所有账户的价值 (统一折算为 CNY)
        COALESCE(SUM(
          (s.value_num / s.value_denom)
          *
          COALESCE(
            (
              SELECT (p.value_num / p.value_denom)
              FROM prices p
              WHERE 
                p.commodity_guid = t.currency_guid 
                AND p.currency_guid = ?              -- 目标货币: CNY
                AND p.date <= t.post_date
              ORDER BY p.date DESC
              LIMIT 1
            ), 
            CASE 
              WHEN t.currency_guid = ? THEN 1.0 -- 如果交易本身就是 CNY
              ELSE 0.0 -- 找不到汇率则暂不计入价值
            END
          )
        ), 0) AS total_value
      FROM commodities c
      -- 关联 STOCK 账户
      LEFT JOIN accounts a ON a.commodity_guid = c.guid AND a.account_type = 'STOCK'
      -- 关联交易分录
      LEFT JOIN splits s ON s.account_guid = a.guid
      LEFT JOIN transactions t ON s.tx_guid = t.guid
      WHERE c.namespace = 'TEMPLATE'
      -- (关键) 仅按商品分组，不按货币分组
      GROUP BY c.guid, c.mnemonic, c.fullname
      ORDER BY c.mnemonic;
    `;

    const params = [CNY_CURRENCY_GUID, CNY_CURRENCY_GUID];
    const results = await db.query(sql, params);

    const responseData = results.map((item) => ({
      ...item,
      stock_level: parseFloat(item.stock_level),
      total_value: parseFloat(item.total_value),
      // 不再返回 currency_code，因为这是多币种汇总
    }));

    res.json(responseData);
  } catch (err) {
    next(err);
  }
};
