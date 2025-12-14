<template>
    <el-card shadow="never">
        <template #header>
            <div class="page-header">
                <h2>{{ $t('nav.purchase_bills') }}</h2>
                <div class="button-group">
                    <el-button type="warning" icon="Money" v-if="authStore.hasRole(['admin', 'finance'])"
                        @click="$router.push({ name: 'CreateVendorPayment' })">
                        {{ $t('purchases.record_payment') }}
                    </el-button>
                    <el-button type="primary" icon="Plus" @click="$router.push({ name: 'CreatePurchaseBill' })">
                        {{ $t('purchases.create_bill') }}
                    </el-button>
                </div>
            </div>
        </template>

        <div v-if="error">
            <el-alert :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
                class="mb-4" />
        </div>

        <el-table v-loading="isLoading" :data="bills" border stripe style="width: 100%">
            <el-table-column prop="id" :label="$t('purchases.bill_id')" min-width="150" />
            <el-table-column prop="vendor_name" :label="$t('purchases.vendor')" min-width="180" />
            <el-table-column :label="$t('purchases.date')" width="180">
                <template #default="scope">
                    {{ formatDateTime(scope.row.date_opened) }}
                </template>
            </el-table-column>
            <el-table-column prop="notes" :label="$t('purchases.notes')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="currency_code" :label="$t('purchases.currency')" width="100" align="center">
                <template #default="scope">
                    <el-tag>{{ scope.row.currency_code }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('customers.actions')" width="120" align="center" fixed="right">
                <template #default="scope">
                    <el-button link type="primary" size="small"
                        @click="$router.push({ name: 'PurchaseBillDetail', params: { guid: scope.row.guid } })">
                        {{ $t('view_details') }}
                    </el-button>
                </template>
            </el-table-column>

            <template #empty>
                <el-empty :description="$t('purchases.no_bills')" />
            </template>
        </el-table>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getPurchaseBills } from '../../services/purchaseService';
import { parseApiError } from '../../utils/errorHandler';
import { formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../store/auth';

const { t } = useI18n();
const authStore = useAuthStore();
const bills = ref([]);
const isLoading = ref(false);
const error = ref(null);

onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await getPurchaseBills();
        bills.value = response.data;
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