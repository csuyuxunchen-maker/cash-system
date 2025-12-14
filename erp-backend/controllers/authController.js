require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// (修改) 移除顶层的 const JWT_SECRET = ... 以确保运行时获取

/**
 * 登录用户
 */
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    const user = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (user.length === 0) {
      return res.status(401).json({ error: res.__("errors.login_failed") });
    }

    const foundUser = user[0];

    const isMatch = await bcrypt.compare(password, foundUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: res.__("errors.login_failed") });
    }

    const payload = {
      id: foundUser.id,
      username: foundUser.username,
      name: foundUser.name,
      role: foundUser.role,
    };

    // (修改) 在这里读取密钥
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "CRITICAL ERROR: JWT_SECRET is missing in environment variables!"
      );
      return res
        .status(500)
        .json({ error: "Internal Server Configuration Error" });
    }

    // (调试建议) 打印密钥前几位，确保与 Middleware 中的一致
    console.log(
      `Debug: Signing token with secret starting with: ${secret.substring(
        0,
        4
      )}...`
    );

    const token = jwt.sign(payload, secret, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    next(err);
  }
};
