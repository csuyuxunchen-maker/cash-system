const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");

// (修改点) 移除注册验证
// const validateRegister = [ ... ];

// 简单的登录验证
const validateLogin = [
  // (修改点)
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// (修改点) 移除 POST /api/v1/auth/register
// router.post("/register", validateRegister, authController.register);

// POST /api/v1/auth/login
router.post("/login", validateLogin, authController.login);

module.exports = router;
