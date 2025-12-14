<template>
    <div class="login-container">
        <el-card class="login-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <h2>{{ $t('login.title') }}</h2>
                    <LanguageSwitcher />
                </div>
            </template>

            <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon :closable="false" class="mb-4" />

            <div class="admin-hint">
                <el-tag type="info" size="small">为防止恶意注册， 设置测试Admin 账号/密码 : admin / admin123</el-tag>
            </div>

            <el-form @submit.prevent="handleLogin" label-position="top" size="large">
                <el-form-item :label="$t('login.account')">
                    <el-input v-model="username" :prefix-icon="User" placeholder="Enter username" />
                </el-form-item>

                <el-form-item :label="$t('login.password')">
                    <el-input v-model="password" type="password" :prefix-icon="Lock" show-password
                        placeholder="Enter password" />
                </el-form-item>

                <el-button type="primary" native-type="submit" :loading="isLoading" class="w-100">
                    {{ isLoading ? $t('login.logging_in') : $t('login.login_button') }}
                </el-button>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useI18n } from 'vue-i18n';
import { User, Lock } from '@element-plus/icons-vue'; // 显式导入图标以防自动导入失效
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMsg = ref(null);

const handleLogin = async () => {
    isLoading.value = true;
    errorMsg.value = null;

    try {
        const success = await authStore.login({
            username: username.value,
            password: password.value
        });

        if (success) {
            router.push({ name: 'Dashboard' });
        } else {
            errorMsg.value = t('login.error');
        }
    } catch (err) {
        errorMsg.value = t('login.error');
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.login-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
    background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
    background-size: 20px 20px;
}

.login-card {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h2 {
            margin: 0;
            font-size: 1.25rem;
            color: #303133;
        }
    }
}

.admin-hint {
    margin-bottom: 1.5rem;
    text-align: center;
}

.mb-4 {
    margin-bottom: 1rem;
}

.w-100 {
    width: 100%;
}
</style>