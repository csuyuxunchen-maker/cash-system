<template>
    <div class="detail-container">
        <div v-if="isLoading" class="loading-wrapper">
            <el-skeleton :rows="5" animated />
        </div>

        <el-alert v-if="error" :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
            class="mb-4" />

        <div v-if="invoice && !isLoading">
            <el-card shadow="never" class="mb-4">
                <template #header>
                    <div class="card-header">
                        <h2>{{ $t('sales.invoice_detail_title') }}: {{ invoice.id }}</h2>
                        <el-button @click="$router.push({ name: 'SalesInvoiceList' })">{{ $t('back_to_list')
                        }}</el-button>
                    </div>
                </template>

                <el-descriptions border :column="2" size="large">
                    <el-descriptions-item :label="$t('sales.customer')">
                        <el-link type="primary" v-if="invoice.owner_guid"
                            @click="$router.push({ name: 'CustomerDetail', params: { guid: invoice.owner_guid } })">
                            {{ invoice.customer_name }}
                        </el-link>
                        <span v-else>{{ invoice.customer_name }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('sales.date')">
                        {{ formatDateTime(invoice.date_opened) }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('sales.currency')">
                        <el-tag>{{ invoice.currency_code }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('sales.notes')">
                        {{ invoice.notes || '-' }}
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>

            <el-card shadow="never">
                <template #header>
                    <h3>{{ $t('sales.line_items') }}</h3>
                </template>

                <el-table :data="invoice.entries" border stripe style="width: 100%">
                    <el-table-column prop="description" :label="$t('sales.description')" min-width="200" />
                    <el-table-column prop="account_name" :label="$t('sales.income_account')" min-width="200" />
                    <el-table-column :label="$t('sales.quantity')" width="120" align="right">
                        <template #default="scope">
                            {{ formatSplitAmount(scope.row.quantity_num, scope.row.quantity_denom) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('sales.price')" width="120" align="right">
                        <template #default="scope">
                            {{ formatSplitAmount(scope.row.i_price_num, scope.row.i_price_denom) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="Total" width="150" align="right">
                        <template #default="scope">
                            {{ formatCurrency(
                                formatSplitAmount(scope.row.quantity_num, scope.row.quantity_denom) *
                                formatSplitAmount(scope.row.i_price_num, scope.row.i_price_denom),
                                invoice.currency_code
                            ) }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getInvoiceDetails } from '../../services/salesService';
import { parseApiError } from '../../utils/errorHandler';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const error = ref(null);
const invoice = ref(null);

const formatSplitAmount = (num, denom) => {
    if (!denom || denom === 0) return 0;
    return (parseFloat(num) / parseFloat(denom));
};

onMounted(async () => {
    const guid = route.params.guid;
    // 检查 GUID 是否有效
    if (!guid || guid === 'undefined' || guid === 'null') {
        console.warn("Invalid invoice GUID:", guid);
        router.replace({ name: 'SalesInvoiceList' });
        return;
    }

    isLoading.value = true;
    error.value = null;

    try {
        const response = await getInvoiceDetails(guid);
        invoice.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style lang="scss" scoped>
.detail-container {
    max-width: 1000px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        margin: 0;
        font-size: 1.25rem;
    }
}

.mb-4 {
    margin-bottom: 20px;
}
</style>