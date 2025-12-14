<template>
    <el-card shadow="never">
        <template #header>
            <div class="page-header">
                <h2>{{ $t('nav.sales_invoices') }}</h2>
                <div class="button-group">
                    <el-button type="warning" icon="Money" v-if="authStore.hasRole(['admin', 'finance'])"
                        @click="$router.push({ name: 'CreateCustomerPayment' })">
                        {{ $t('sales.record_payment') }}
                    </el-button>
                    <el-button type="primary" icon="Plus" @click="$router.push({ name: 'CreateSalesInvoice' })">
                        {{ $t('sales.create_invoice') }}
                    </el-button>
                </div>
            </div>
        </template>

        <div v-if="error">
            <el-alert :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
                class="mb-4" />
        </div>

        <el-table v-loading="isLoading" :data="invoices" border stripe style="width: 100%">
            <el-table-column prop="id" :label="$t('sales.invoice_id')" min-width="150" sortable />
            <el-table-column prop="customer_name" :label="$t('sales.customer')" min-width="180" sortable />
            <el-table-column :label="$t('sales.date')" width="180" sortable prop="date_opened">
                <template #default="scope">
                    {{ formatDateTime(scope.row.date_opened) }}
                </template>
            </el-table-column>
            <el-table-column prop="notes" :label="$t('sales.notes')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="currency_code" :label="$t('sales.currency')" width="100" align="center">
                <template #default="scope">
                    <el-tag>{{ scope.row.currency_code }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('customers.actions')" width="120" align="center" fixed="right">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="viewDetails(scope.row)">
                        {{ $t('view_details') }}
                    </el-button>
                </template>
            </el-table-column>

            <template #empty>
                <el-empty :description="$t('sales.no_invoices')" />
            </template>
        </el-table>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getSalesInvoices } from '../../services/salesService';
import { parseApiError } from '../../utils/errorHandler';
import { formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../store/auth';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const invoices = ref([]);
const isLoading = ref(false);
const error = ref(null);

// 安全的跳转函数
const viewDetails = (row) => {
    if (row && row.guid) {
        router.push({ name: 'SalesInvoiceDetail', params: { guid: row.guid } });
    } else {
        console.error("Invalid invoice row:", row);
        // 可以添加一个提示
    }
};

onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await getSalesInvoices();
        invoices.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style lang="scss" scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        margin: 0;
        font-size: 1.25rem;
    }
}

.button-group {
    display: flex;
    gap: 10px;
}

.mb-4 {
    margin-bottom: 20px;
}
</style>