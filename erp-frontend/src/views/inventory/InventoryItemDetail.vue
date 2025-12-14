<template>
    <div class="detail-container">
        <div v-if="isLoading" class="loading-wrapper">
            <el-skeleton :rows="5" animated />
        </div>

        <el-alert v-if="error" :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
            class="mb-4" />

        <div v-if="itemDetails && !isLoading">
            <el-card shadow="never" class="mb-4">
                <template #header>
                    <div class="card-header">
                        <h2>{{ $t('inventory.item_details') }}</h2>
                        <el-button @click="$router.push({ name: 'Inventory' })">{{ $t('back_to_list') }}</el-button>
                    </div>
                </template>

                <h3>{{ $t('inventory.summary_by_currency') }}</h3>
                <el-table :data="itemDetails.summary" border style="width: 100%">
                    <el-table-column prop="account_name" :label="$t('inventory.stock_account')" />
                    <el-table-column prop="currency_code" :label="$t('inventory.valuation_currency')" width="150"
                        align="center" />
                    <el-table-column prop="total_quantity" :label="$t('inventory.stock_level')" align="right" />
                    <el-table-column label="Total Value" align="right">
                        <template #default="scope">
                            {{ formatCurrency(scope.row.total_value, scope.row.currency_code) }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <el-card shadow="never">
                <template #header>
                    <h3>{{ $t('inventory.ledger_stream') }}</h3>
                </template>

                <el-table :data="itemDetails.ledger" stripe style="width: 100%">
                    <el-table-column :label="$t('sales.date')" width="180">
                        <template #default="scope">
                            {{ formatDateTime(scope.row.post_date) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" :label="$t('purchases.description')" min-width="200" />
                    <el-table-column :label="$t('inventory.quantity_change')" align="right" width="150">
                        <template #default="scope">
                            <span :class="getQuantityClass(scope.row.quantity_num)">
                                {{ formatSplitAmount(scope.row.quantity_num, scope.row.quantity_denom) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('inventory.value_change')" align="right" width="180">
                        <template #default="scope">
                            {{ formatCurrency(
                                formatSplitAmount(scope.row.value_num, scope.row.value_denom),
                                scope.row.currency_code
                            ) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="account_name" :label="$t('inventory.stock_account')" width="200" />
                </el-table>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getInventoryItemDetails } from '../../services/inventoryService';
import { parseApiError } from '../../utils/errorHandler';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const { t } = useI18n();
const route = useRoute();
const isLoading = ref(false);
const error = ref(null);
const itemDetails = ref(null);

const formatSplitAmount = (num, denom) => {
    if (!denom || denom === 0) return 0;
    return (parseFloat(num) / parseFloat(denom));
};

const getQuantityClass = (num) => {
    return parseFloat(num) >= 0 ? 'text-success' : 'text-danger';
};

onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    const guid = route.params.commodity_guid;

    try {
        const response = await getInventoryItemDetails(guid);
        itemDetails.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style lang="scss" scoped>
.detail-container {
    max-width: 1200px;
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

.text-success {
    color: #67C23A;
}

.text-danger {
    color: #F56C6C;
}
</style>