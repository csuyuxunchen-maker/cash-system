<template>
    <div class="dashboard-container">
        <div class="welcome-banner mb-4">
            <h1>{{ $t('dashboard.welcome') }}, {{ username }}!</h1>
        </div>

        <div v-if="isLoading" class="loading-wrapper">
            <el-skeleton :rows="5" animated />
        </div>

        <el-alert v-if="error" :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
            class="mb-4" />

        <div v-if="kpiData && !isLoading">
            <el-row :gutter="20" class="mb-4">
                <el-col :xs="24" :sm="8">
                    <el-card shadow="hover" class="kpi-card">
                        <template #header>
                            <div class="card-header">
                                <span>{{ $t('reports.net_income') }} (YTD)</span>
                                <el-tag type="success">CNY</el-tag>
                            </div>
                        </template>
                        <div class="kpi-value text-success">
                            {{ formatCurrency(kpiData.netIncome, 'CNY') }}
                        </div>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="8">
                    <el-card shadow="hover" class="kpi-card">
                        <template #header>
                            <div class="card-header">
                                <span>{{ $t('reports.total_assets') }}</span>
                                <el-tag>CNY</el-tag>
                            </div>
                        </template>
                        <div class="kpi-value text-primary">
                            {{ formatCurrency(kpiData.totalAssets, 'CNY') }}
                        </div>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="8">
                    <el-card shadow="hover" class="kpi-card">
                        <template #header>
                            <div class="card-header">
                                <span>{{ $t('reports.total_liabilities') }}</span>
                                <el-tag type="danger">CNY</el-tag>
                            </div>
                        </template>
                        <div class="kpi-value text-danger">
                            {{ formatCurrency(kpiData.totalLiabilities, 'CNY') }}
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-card shadow="never">
                <template #header>
                    <h3>{{ $t('dashboard.quick_actions') }}</h3>
                </template>
                <div class="action-buttons">
                    <el-button type="primary" size="large" icon="DocumentAdd"
                        @click="$router.push({ name: 'CreateSalesInvoice' })">
                        {{ $t('sales.create_invoice') }}
                    </el-button>
                    <el-button type="primary" size="large" icon="ShoppingCart"
                        @click="$router.push({ name: 'CreatePurchaseBill' })">
                        {{ $t('purchases.create_bill') }}
                    </el-button>
                    <el-button type="warning" size="large" icon="EditPen" v-if="authStore.hasRole(['admin', 'finance'])"
                        @click="$router.push({ name: 'CreateJournalEntry' })">
                        {{ $t('ledger.create_journal') }}
                    </el-button>
                    <el-button size="large" icon="Box" @click="$router.push({ name: 'InventoryAdjustment' })">
                        {{ $t('inventory.adjust') }}
                    </el-button>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../store/auth';
import { getProfitLoss, getBalanceSheet } from '../services/reportService';
import { formatCurrency, getISODate } from '../utils/formatters';
import { parseApiError } from '../utils/errorHandler';

const { t } = useI18n();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref(null);
const kpiData = ref(null);

const username = computed(() => authStore.user?.name || authStore.user?.username || 'User');

onMounted(async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const today = getISODate(new Date());
        const yearStart = getISODate(new Date(new Date().getFullYear(), 0, 1));

        const [plResponse, bsResponse] = await Promise.all([
            getProfitLoss(yearStart, today),
            getBalanceSheet(today)
        ]);

        kpiData.value = {
            netIncome: plResponse.data.net_income,
            totalAssets: bsResponse.data.assets.total,
            totalLiabilities: bsResponse.data.liabilities.total
        };

    } catch (err) {
        console.error("Failed to load dashboard data:", err);
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style lang="scss" scoped>
.mb-4 {
    margin-bottom: 20px;
}

.kpi-card {
    height: 100%;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: #606266;
    }

    .kpi-value {
        font-size: 1.8rem;
        font-weight: bold;
        text-align: center;
        padding: 10px 0;
    }
}

.text-success {
    color: #67C23A;
}

.text-primary {
    color: #409EFF;
}

.text-danger {
    color: #F56C6C;
}

.action-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}
</style>