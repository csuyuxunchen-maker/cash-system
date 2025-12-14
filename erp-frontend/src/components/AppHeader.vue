<template>
    <div class="app-header-right">
        <LanguageSwitcher />

        <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-info-dropdown">
                <el-avatar :size="32" icon="UserFilled" class="user-avatar" />
                <span class="username">{{ username }}</span>
                <el-icon class="el-icon--right">
                    <arrow-down />
                </el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="logout" divided>{{ $t('nav.logout') }}</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../store/auth';
import LanguageSwitcher from './common/LanguageSwitcher.vue';

const authStore = useAuthStore();

const username = computed(() => authStore.user?.username || 'User');

const handleCommand = (command) => {
    if (command === 'logout') {
        authStore.logout();
    }
};
</script>

<style lang="scss" scoped>
.app-header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-right: 20px;
    height: 100%;
}

.user-info-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #f5f7fa;
    }

    .user-avatar {
        background-color: #409EFF;
    }

    .username {
        margin-left: 8px;
        font-weight: 500;
        font-size: 14px;
    }
}
</style>