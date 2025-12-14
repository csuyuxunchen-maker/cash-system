const db = require("../config/db");
const { generateGuid } = require("../utils/guidHelper");

exports.getCurrencies = async (req, res, next) => {
  try {
    const sql =
      "SELECT guid, mnemonic, fullname FROM commodities WHERE namespace = 'CURRENCY'";
    const currencies = await db.query(sql);
    res.json(currencies);
  } catch (err) {
    next(err);
  }
};

exports.getPrice = async (req, res, next) => {
  try {
    const { from_guid, to_guid } = req.query;
    const sql = `
      SELECT value_num, value_denom 
      FROM prices 
      WHERE commodity_guid = ? AND currency_guid = ?
      ORDER BY date DESC 
      LIMIT 1
    `;
    const price = await db.query(sql, [from_guid, to_guid]);
    if (price.length === 0) {
      return res.status(404).json({ message: "Price not found" });
    }
    res.json({
      rate: parseFloat(price[0].value_num) / parseFloat(price[0].value_denom),
    });
  } catch (err) {
    next(err);
  }
};

exports.getStockItems = async (req, res, next) => {
  try {
    const sql =
      "SELECT guid, mnemonic, fullname FROM commodities WHERE namespace = 'TEMPLATE'";
    const items = await db.query(sql);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// (!!修改!!) 创建商品并自动初始化所有货币的库存账户
exports.createStockItem = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const {
      mnemonic, // SKU
      fullname, // 商品名称
    } = req.body;

    await connection.beginTransaction();

    // 1. 创建商品 (Commodity)
    const commodity_guid = generateGuid();
    const commoditySql = `
      INSERT INTO commodities (guid, namespace, mnemonic, fullname, fraction, quote_flag)
      VALUES (?, 'TEMPLATE', ?, ?, 100, 0)
    `;
    await connection.execute(commoditySql, [
      commodity_guid,
      mnemonic,
      fullname,
    ]);

    // 2. (新增逻辑) 查找所有库存父账户 (例如 Inventory (USD), Inventory (CNY))
    // 假设父账户名称格式为 'Inventory (%)' 且是占位符
    const parentsSql = `
      SELECT guid, name, commodity_guid 
      FROM accounts 
      WHERE account_type = 'ASSET' 
      AND placeholder = 1 
      AND name LIKE 'Inventory (%)'
    `;
    const [parentAccounts] = await connection.query(parentsSql);

    if (parentAccounts.length === 0) {
      // 如果没有找到父账户，可能需要手动处理或抛出警告，这里我们暂且不创建子账户
      console.warn(
        "No parent inventory accounts found. Stock accounts were not created."
      );
    }

    // 3. 为每个货币父账户创建一个对应的 STOCK 子账户
    const accountSql = `
      INSERT INTO accounts (guid, name, account_type, commodity_guid, commodity_scu, non_std_scu, 
                            parent_guid, code, description, hidden, placeholder)
      VALUES (?, ?, 'STOCK', ?, 100, 0, ?, ?, ?, 0, 0)
    `;

    const createdAccounts = [];

    for (const parent of parentAccounts) {
      const stock_account_guid = generateGuid();
      // 获取括号内的货币名称以便命名，例如 "Inventory - Widget (USD)"
      const currencySuffix = parent.name.match(/\(([^)]+)\)/)?.[0] || "";

      await connection.execute(accountSql, [
        stock_account_guid,
        `Inventory - ${fullname} ${currencySuffix}`, // 账户名称
        commodity_guid, // 这里的 commodity_guid 指向新建的商品
        parent.guid, // 父账户 GUID
        "", // Code
        `Tracks ${mnemonic} quantity in ${currencySuffix}`,
      ]);
      createdAccounts.push(stock_account_guid);
    }

    await connection.commit();

    res.status(201).json({
      commodity_guid: commodity_guid,
      created_stock_accounts: createdAccounts.length,
      message:
        "Stock item created and initialized for all available currencies.",
    });
  } catch (err) {
    await connection.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "SKU (mnemonic) already exists" });
    }
    next(err);
  } finally {
    connection.release();
  }
};
