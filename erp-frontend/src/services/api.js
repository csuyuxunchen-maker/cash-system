import axios from "axios";
import { useAuthStore } from "../store/auth";
import router from "../router";
import i18n from "../i18n";

// 1. 创建 Axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 请求拦截器 (Request Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 自动附加当前语言
    const currentLocale = i18n.global.locale.value;
    if (currentLocale) {
      config.headers["Accept-Language"] = currentLocale;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 (Response Interceptor)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const authStore = useAuthStore();

    if (error.response) {
      const { status } = error.response;

      // (修改) 判断是否为登录请求
      // 如果是登录请求本身的 401 错误，不应触发全局登出，而是应该由 Login 页面处理
      const isLoginRequest =
        error.config && error.config.url.includes("/auth/login");

      if ((status === 401 || status === 403) && !isLoginRequest) {
        console.error("Authentication error. Logging out.");
        authStore.logout();
        router.push("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
