require("dotenv").config();
const jwt = require("jsonwebtoken");

/**
 * 认证中间件
 * 检查 'Authorization: Bearer <token>' 头部
 */
function isAuthenticated(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: res.__("errors.unauthorized") });
  }

  // (修改) 在函数内部读取密钥，防止模块加载顺序导致的环境变量未加载问题
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error(
      "CRITICAL ERROR: JWT_SECRET is missing in environment variables!"
    );
    return res
      .status(500)
      .json({ error: "Internal Server Configuration Error" });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      // (调试建议) 如果报错，打印一下密钥的前几位，检查是否与 Login 时的一致
      console.error(
        `Debug: Verify using secret starting with: ${secret.substring(0, 4)}...`
      );
      return res.status(403).json({ error: res.__("errors.forbidden") });
    }

    req.user = user;
    next();
  });
}

/**
 * 授权中间件 (可选)
 */
function hasRole(roles = []) {
  return (req, res, next) => {
    const { user } = req;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: res.__("errors.forbidden") });
    }

    next();
  };
}

module.exports = {
  isAuthenticated,
  hasRole,
};
