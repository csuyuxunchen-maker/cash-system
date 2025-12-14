// createAdmin.js
const bcrypt = require("bcryptjs");

// 您想要的密码
const password = "tzx123";

async function hashPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log("============================================================");
    console.log("请将下面这串哈希值复制到 init.sql 文件中:");
    console.log(hash);
    console.log("============================================================");
  } catch (err) {
    console.error("生成哈希时出错:", err);
  }
}

hashPassword();
