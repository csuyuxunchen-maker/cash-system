<template>
    <div class="detail-container">
        <div v-if="isLoading" class="loading-wrapper">
            <el-skeleton :rows="5" animated />
        </div>

        <el-alert v-if="error" :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
            class="mb-4" />

        <div v-if="bill && !isLoading">
            <el-card shadow="never" class="mb-4">
                <template #header>
                    <div class="card-header">
                        <h2>{{ $t('purchases.bill_detail_title') }}: {{ bill.id }}</h2>
                        <el-button @click="$router.push({ name: 'PurchaseBillList' })">{{ $t('back_to_list')
                            }}</el-button>
                    </div>
                </template>

                <el-descriptions border :column="2" size="large">
                    <el-descriptions-item :label="$t('purchases.vendor')">
                        {{ bill.vendor_name }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('purchases.date')">
                        {{ formatDateTime(bill.date_opened) }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('purchases.currency')">
                        <el-tag>{{ bill.currency_code }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('purchases.notes')">
                        {{ bill.notes }}
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>

            <el-card shadow="never">
                <template #header>
                    <h3>{{ $t('purchases.line_items') }}</h3>
                </template>

                <el-table :data="bill.entries" border stripe style="width: 100%">
                    <el-table-column prop="description" :label="$t('purchases.description')" min-width="200" />
                    <el-table-column prop="account_name" :label="$t('purchases.expense_account')" min-width="200" />
                    <el-table-column :label="$t('purchases.quantity')" width="120" align="right">
                        <template #default="scope">
                            {{ formatSplitAmount(scope.row.quantity_num, scope.row.quantity_denom) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('purchases.price')" width="120" align="right">
                        <template #default="scope">
                            {{ formatSplitAmount(scope.row.b_price_num, scope.row.b_price_denom) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="Total" width="150" align="right">
                        <template #default="scope">
                            {{ formatCurrency(
                                formatSplitAmount(scope.row.quantity_num, scope.row.quantity_denom) *
                                formatSplitAmount(scope.row.b_price_num, scope.row.b_price_denom),
                                bill.currency_code
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
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getPurchaseBillDetails } from '../../services/purchaseService';
import { parseApiError } from '../../utils/errorHandler';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const { t } = useI18n();
const route = useRoute();
const isLoading = ref(false);
const error = ref(null);
const bill = ref(null);

const formatSplitAmount = (num, denom) => {
    if (!denom || denom === 0) return 0;
    return (parseFloat(num) / parseFloat(denom));
};

onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    const guid = route.params.guid;

    try {
        const response = await getPurchaseBillDetails(guid);
        bill.value = response.data;
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