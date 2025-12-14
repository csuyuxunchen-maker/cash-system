<template>
    <el-card shadow="never">
        <template #header>
            <div class="page-header">
                <h2>{{ $t('nav.inventory') }}</h2>
                <div class="button-group">
                    <el-button v-if="authStore.hasRole(['admin'])" icon="Plus"
                        @click="$router.push({ name: 'InventoryCreateItem' })">
                        {{ $t('inventory.create_item') }}
                    </el-button>
                    <el-button type="primary" icon="Box" @click="$router.push({ name: 'InventoryAdjustment' })">
                        {{ $t('inventory.adjust') }}
                    </el-button>
                </div>
            </div>
        </template>

        <div v-if="error">
            <el-alert :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
                class="mb-4" />
        </div>

        <el-table v-loading="isLoading" :data="stockList" border stripe style="width: 100%">
            <el-table-column prop="fullname" :label="$t('inventory.item_name')" min-width="200" sortable />
            <el-table-column prop="mnemonic" :label="`${$t('inventory.mnemonic')} (SKU)`" width="150" sortable />
            <el-table-column prop="stock_level" :label="$t('inventory.stock_level')" width="150" align="right"
                sortable />

            <el-table-column :label="$t('inventory.total_value')" width="180" align="right" sortable
                :sort-method="(a, b) => a.total_value - b.total_value">
                <template #header>
                    <span>
                        {{ $t('inventory.total_value') }} (CNY)
                        <el-tooltip content="Estimated total value of all currency holdings converted to CNY."
                            placement="top">
                            <el-icon>
                                <InfoFilled />
                            </el-icon>
                        </el-tooltip>
                    </span>
                </template>
                <template #default="scope">
                    {{ formatCurrency(scope.row.total_value, 'CNY') }}
                </template>
            </el-table-column>

            <el-table-column :label="$t('vendors.actions')" width="120" fixed="right" align="center">
                <template #default="scope">
                    <el-button link type="primary" size="small"
                        @click="$router.push({ name: 'InventoryItemDetail', params: { commodity_guid: scope.row.guid } })">
                        {{ $t('inventory.view_details') }}
                    </el-button>
                </template>
            </el-table-column>

            <template #empty>
                <el-empty :description="$t('inventory.no_items')" />
            </template>
        </el-table>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getStockLevelsBatch } from '../../services/inventoryService';
import { parseApiError } from '../../utils/errorHandler';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../store/auth';
import { InfoFilled } from '@element-plus/icons-vue';

const { t } = useI18n();
const authStore = useAuthStore();
const stockList = ref([]);
const isLoading = ref(false);
const error = ref(null);

onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await getStockLevelsBatch();
        stockList.value = response.data;
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