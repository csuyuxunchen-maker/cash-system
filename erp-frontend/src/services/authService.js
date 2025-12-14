import apiClient from "./api";

/**
 * 登录
 * @param {object} credentials - { email, password }
 */
export function login(credentials) {
  // 指向 /api/v1/auth/login
  return apiClient.post("/auth/login", credentials);
}

/**
 * (修改点) 注册函数已移除
 */
