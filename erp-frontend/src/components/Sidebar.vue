<template>
    <div class="sidebar-wrapper">
        <el-menu :default-active="activeMenu" mode="horizontal" :router="true" :ellipsis="false" class="top-menu">

            <div class="logo-container">
                <h3>ERP System</h3>
            </div>

            <el-menu-item index="Dashboard" :route="{ name: 'Dashboard' }">
                <el-icon>
                    <Odometer />
                </el-icon>
                <span>{{ $t('nav.dashboard') }}</span>
            </el-menu-item>

            <el-sub-menu index="sales">
                <template #title>
                    <el-icon>
                        <Sell />
                    </el-icon>
                    <span>{{ $t('nav.sales') }}</span>
                </template>
                <el-menu-item index="SalesInvoiceList" :route="{ name: 'SalesInvoiceList' }">
                    {{ $t('nav.sales_invoices') }}
                </el-menu-item>
                <el-menu-item index="CustomerList" :route="{ name: 'CustomerList' }">
                    {{ $t('nav.customers') }}
                </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="purchases">
                <template #title>
                    <el-icon>
                        <ShoppingCart />
                    </el-icon>
                    <span>{{ $t('nav.purchases') }}</span>
                </template>
                <el-menu-item index="PurchaseBillList" :route="{ name: 'PurchaseBillList' }">
                    {{ $t('nav.purchase_bills') }}
                </el-menu-item>
                <el-menu-item index="VendorList" :route="{ name: 'VendorList' }">
                    {{ $t('nav.vendors') }}
                </el-menu-item>
            </el-sub-menu>

            <el-menu-item index="Inventory" :route="{ name: 'Inventory' }">
                <el-icon>
                    <Box />
                </el-icon>
                <span>{{ $t('nav.inventory') }}</span>
            </el-menu-item>

            <el-menu-item index="AccountList" :route="{ name: 'AccountList' }">
                <el-icon>
                    <Notebook />
                </el-icon>
                <span>{{ $t('nav.ledger') }}</span>
            </el-menu-item>

            <el-menu-item v-if="authStore.hasRole(['admin', 'finance'])" index="Reports" :route="{ name: 'Reports' }">
                <el-icon>
                    <TrendCharts />
                </el-icon>
                <span>{{ $t('nav.reports') }}</span>
            </el-menu-item>

        </el-menu>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const route = useRoute();

const activeMenu = computed(() => {
    return route.name;
});
</script>

<style lang="scss" scoped>
.sidebar-wrapper {
    width: 100%;
}

.top-menu {
    border-bottom: none !important;
    /* 移除默认下边框，由 header 处理 */
    height: 60px;
    align-items: center;
    background-color: transparent;
}

.logo-container {
    display: flex;
    align-items: center;
    padding: 0 20px;
    margin-right: 20px;
    height: 100%;
    cursor: pointer;

    h3 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 700;
        color: #409EFF;
        /* 使用主色调 */
        white-space: nowrap;
    }
}

/* 覆盖 Element Plus 菜单项样式以适应顶部栏 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    height: 60px;
    line-height: 60px;
    font-size: 15px;
}

:deep(.el-menu-item.is-active) {
    border-bottom: 2px solid #409EFF;
    color: #409EFF !important;
    background-color: rgba(64, 158, 255, 0.05) !important;
}
</style>