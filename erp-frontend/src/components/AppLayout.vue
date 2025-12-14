<template>
    <el-container class="app-layout is-vertical">
        <el-header class="app-header-wrapper">
            <div class="header-content">
                <Sidebar class="top-nav" />

                <AppHeader class="user-actions" />
            </div>
        </el-header>

        <el-main class="main-content">
            <div class="content-inner">
                <router-view />
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import AppHeader from './AppHeader.vue';
</script>

<style lang="scss" scoped>
.app-layout {
    height: 100vh;
    width: 100vw;
    background-color: #f0f2f5;
}

.app-header-wrapper {
    padding: 0;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    z-index: 10;
    height: 60px;
    /* 固定高度 */
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    max-width: 100%;
    margin: 0;
}

.top-nav {
    flex: 1;
    min-width: 0;
    /* 防止 flex 子元素溢出 */
}

.user-actions {
    flex-shrink: 0;
    margin-left: 20px;
}

.main-content {
    padding: 20px;
    overflow-y: auto;
}

.content-inner {
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100%;
}
</style>