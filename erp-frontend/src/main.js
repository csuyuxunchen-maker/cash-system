import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus"; // 新增
import "element-plus/dist/index.css"; // 新增
import * as ElementPlusIconsVue from "@element-plus/icons-vue"; // 新增
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import "./assets/main.scss";
import { useAuthStore } from "./store/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// 注册 Element Plus
app.use(ElementPlus);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

const authStore = useAuthStore();
authStore.checkTokenOnLoad();

app.use(i18n);
app.use(router);

app.mount("#app");
