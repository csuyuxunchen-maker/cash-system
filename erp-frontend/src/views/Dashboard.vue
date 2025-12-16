<template>
    <div class="dashboard-container">
        <div class="welcome-banner mb-4">
            <div class="welcome-text">
                <h1>{{ $t('dashboard.welcome') }}, {{ username }}!</h1>
                <p class="subtitle">{{ currentDate }}</p>
            </div>
            <div class="header-actions">
                <el-button type="primary" icon="Refresh" circle @click="refreshData" :loading="isLoading" />
            </div>
        </div>

        <el-alert v-if="error" :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
            class="mb-4" />

        <el-row :gutter="20" class="mb-4">
            <el-col :xs="24" :sm="8">
                <el-card shadow="hover" class="kpi-card income-card">
                    <div class="kpi-content">
                        <div class="kpi-icon">
                            <el-icon>
                                <Money />
                            </el-icon>
                        </div>
                        <div class="kpi-info">
                            <div class="kpi-label">{{ $t('reports.net_income') }} (YTD)</div>
                            <div class="kpi-value" :class="getAmountClass(kpiData.netIncome)">
                                {{ formatCurrency(kpiData.netIncome, 'CNY') }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="8">
                <el-card shadow="hover" class="kpi-card asset-card">
                    <div class="kpi-content">
                        <div class="kpi-icon">
                            <el-icon>
                                <Wallet />
                            </el-icon>
                        </div>
                        <div class="kpi-info">
                            <div class="kpi-label">{{ $t('reports.total_assets') }}</div>
                            <div class="kpi-value text-primary">
                                {{ formatCurrency(kpiData.totalAssets, 'CNY') }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="8">
                <el-card shadow="hover" class="kpi-card liability-card">
                    <div class="kpi-content">
                        <div class="kpi-icon">
                            <el-icon>
                                <CreditCard />
                            </el-icon>
                        </div>
                        <div class="kpi-info">
                            <div class="kpi-label">{{ $t('reports.total_liabilities') }}</div>
                            <div class="kpi-value text-danger">
                                {{ formatCurrency(kpiData.totalLiabilities, 'CNY') }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4">
            <el-col :xs="24" :lg="12" class="mb-col">
                <el-card shadow="never" class="dashboard-card">
                    <template #header>
                        <div class="card-header">
                            <span><el-icon class="mr-1">
                                    <Sell />
                                </el-icon> Recent Sales</span>
                            <el-button link type="primary" @click="$router.push({ name: 'SalesInvoiceList' })">View
                                All</el-button>
                        </div>
                    </template>
                    <el-table :data="recentSales" style="width: 100%" size="small" :border="false" stripe>
                        <el-table-column prop="date_opened" :label="$t('sales.date')" width="110">
                            <template #default="scope">{{ formatDateSimple(scope.row.date_opened) }}</template>
                        </el-table-column>
                        <el-table-column prop="customer_name" :label="$t('sales.customer')" show-overflow-tooltip />
                        <el-table-column prop="id" :label="$t('sales.invoice_id')" width="140" />
                        <el-table-column width="50" align="center">
                            <template #default="scope">
                                <el-button link icon="ArrowRight"
                                    @click="$router.push({ name: 'SalesInvoiceDetail', params: { guid: scope.row.guid } })" />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>

            <el-col :xs="24" :lg="12">
                <el-card shadow="never" class="dashboard-card">
                    <template #header>
                        <div class="card-header">
                            <span><el-icon class="mr-1">
                                    <ShoppingCart />
                                </el-icon> Recent Purchases</span>
                            <el-button link type="primary" @click="$router.push({ name: 'PurchaseBillList' })">View
                                All</el-button>
                        </div>
                    </template>
                    <el-table :data="recentPurchases" style="width: 100%" size="small" :border="false" stripe>
                        <el-table-column prop="date_opened" :label="$t('sales.date')" width="110">
                            <template #default="scope">{{ formatDateSimple(scope.row.date_opened) }}</template>
                        </el-table-column>
                        <el-table-column prop="vendor_name" :label="$t('purchases.vendor')" show-overflow-tooltip />
                        <el-table-column prop="id" :label="$t('purchases.bill_id')" width="140" />
                        <el-table-column width="50" align="center">
                            <template #default="scope">
                                <el-button link icon="ArrowRight"
                                    @click="$router.push({ name: 'PurchaseBillDetail', params: { guid: scope.row.guid } })" />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :xs="24" :md="14" class="mb-col">
                <el-card shadow="never" class="dashboard-card h-100">
                    <template #header>
                        <div class="card-header">
                            <span class="text-warning"><el-icon class="mr-1">
                                    <Warning />
                                </el-icon> Low Stock Alert (&lt; 10)</span>
                            <el-button link type="primary"
                                @click="$router.push({ name: 'Inventory' })">Manage</el-button>
                        </div>
                    </template>
                    <el-table v-if="lowStockItems.length > 0" :data="lowStockItems" style="width: 100%" size="small">
                        <el-table-column prop="mnemonic" label="SKU" width="120" />
                        <el-table-column prop="fullname" :label="$t('inventory.item_name')" />
                        <el-table-column prop="stock_level" :label="$t('inventory.stock_level')" width="100"
                            align="right">
                            <template #default="scope">
                                <el-tag type="danger" size="small" effect="dark">{{ scope.row.stock_level }}</el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else :image-size="60" description="Inventory looks good!" />
                </el-card>
            </el-col>

            <el-col :xs="24" :md="10">
                <el-card shadow="never" class="dashboard-card h-100">
                    <template #header>
                        <div class="card-header">
                            <span><el-icon class="mr-1">
                                    <Lightning />
                                </el-icon> {{ $t('dashboard.quick_actions') }}</span>
                        </div>
                    </template>
                    <div class="action-buttons-grid">
                        <el-button type="primary" class="quick-btn" icon="DocumentAdd"
                            @click="$router.push({ name: 'CreateSalesInvoice' })">
                            Sales Invoice
                        </el-button>
                        <el-button type="success" class="quick-btn" icon="ShoppingCart"
                            @click="$router.push({ name: 'CreatePurchaseBill' })">
                            Purchase Bill
                        </el-button>
                        <el-button type="warning" class="quick-btn" icon="EditPen"
                            v-if="authStore.hasRole(['admin', 'finance'])"
                            @click="$router.push({ name: 'CreateJournalEntry' })">
                            Journal Entry
                        </el-button>
                        <el-button type="info" class="quick-btn" icon="Box"
                            @click="$router.push({ name: 'InventoryAdjustment' })">
                            Adjust Stock
                        </el-button>
                        <el-button plain class="quick-btn" icon="User"
                            @click="$router.push({ name: 'CustomerCreate' })">
                            New Customer
                        </el-button>
                        <el-button plain class="quick-btn" icon="Van" @click="$router.push({ name: 'VendorCreate' })">
                            New Vendor
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../store/auth';
import { getProfitLoss, getBalanceSheet } from '../services/reportService';
import { getSalesInvoices } from '../services/salesService';
import { getPurchaseBills } from '../services/purchaseService';
import { getStockLevelsBatch } from '../services/inventoryService';
import { formatCurrency, getISODate, formatDateTime } from '../utils/formatters';
import { parseApiError } from '../utils/errorHandler';

const { t } = useI18n();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref(null);
const kpiData = ref({ netIncome: 0, totalAssets: 0, totalLiabilities: 0 });
const recentSales = ref([]);
const recentPurchases = ref([]);
const lowStockItems = ref([]);

const username = computed(() => authStore.user?.name || authStore.user?.username || 'User');
const currentDate = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const getAmountClass = (amount) => amount >= 0 ? 'text-success' : 'text-danger';
const formatDateSimple = (isoDate) => {
    if (!isoDate) return '-';
    return new Date(isoDate).toLocaleDateString();
};

const refreshData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const today = getISODate(new Date());
        const yearStart = getISODate(new Date(new Date().getFullYear(), 0, 1));

        // 并行加载所有数据
        const [plRes, bsRes, salesRes, purchRes, stockRes] = await Promise.all([
            getProfitLoss(yearStart, today),
            getBalanceSheet(today),
            getSalesInvoices(),
            getPurchaseBills(),
            getStockLevelsBatch()
        ]);

        // 1. 设置 KPI
        kpiData.value = {
            netIncome: plRes.data.net_income,
            totalAssets: bsRes.data.assets.total,
            totalLiabilities: bsRes.data.liabilities.total
        };

        // 2. 最近5笔销售
        recentSales.value = (salesRes.data || []).slice(0, 5);

        // 3. 最近5笔采购
        recentPurchases.value = (purchRes.data || []).slice(0, 5);

        // 4. 低库存预警 (数量 < 10)
        lowStockItems.value = (stockRes.data || [])
            .filter(item => item.stock_level < 10)
            .sort((a, b) => a.stock_level - b.stock_level)
            .slice(0, 5); // 只显示前5个

    } catch (err) {
        console.error("Failed to load dashboard data:", err);
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    refreshData();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
    padding-bottom: 20px;
}

.welcome-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #303133;
    }

    .subtitle {
        margin: 5px 0 0;
        color: #909399;
        font-size: 0.9rem;
    }
}

.kpi-card {
    height: 100%;
    border: none;
    background: #fff;
    transition: transform 0.3s;

    &:hover {
        transform: translateY(-5px);
    }

    .kpi-content {
        display: flex;
        align-items: center;
        padding: 10px;
    }

    .kpi-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-right: 15px;
        background-color: #f0f2f5;
        color: #606266;
    }

    &.income-card .kpi-icon {
        background-color: #f0f9eb;
        color: #67C23A;
    }

    &.asset-card .kpi-icon {
        background-color: #ecf5ff;
        color: #409EFF;
    }

    &.liability-card .kpi-icon {
        background-color: #fef0f0;
        color: #F56C6C;
    }

    .kpi-label {
        font-size: 0.9rem;
        color: #909399;
    }

    .kpi-value {
        font-size: 1.6rem;
        font-weight: 700;
        margin-top: 5px;
    }
}

.dashboard-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
    }
}

.action-buttons-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;

    .quick-btn {
        margin: 0;
        width: 100%;
        height: 50px;
        justify-content: flex-start;
        padding-left: 20px;
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

.text-warning {
    color: #E6A23C;
}

.mb-4 {
    margin-bottom: 20px;
}

.mb-col {
    margin-bottom: 20px;
}

.mr-1 {
    margin-right: 5px;
}

.h-100 {
    height: 100%;
}

/* 响应式调整 */
@media (min-width: 992px) {
    .mb-col {
        margin-bottom: 0;
    }
}
</style>