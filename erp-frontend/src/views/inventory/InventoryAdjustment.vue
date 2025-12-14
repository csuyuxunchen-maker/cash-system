<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ $t('inventory.adjust') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form :model="adjustment" label-position="top">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('inventory.item_name')" required>
                            <CommodityPicker v-model="adjustment.commodity_guid" @itemSelected="onItemSelected" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('reports.report_currency')" required>
                            <CurrencyPicker v-model="adjustment.currency_guid" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('inventory.quantity_change')" required>
                            <el-input-number v-model="adjustment.quantity_change" :step="1" style="width: 100%" />
                            <div class="form-help-text">{{ $t('inventory.quantity_note') }}</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('inventory.cost_per_unit')" required>
                            <el-input-number v-model="adjustment.cost_per_unit" :min="0" :precision="2" :step="0.01"
                                style="width: 100%" />
                            <div class="form-help-text">{{ $t('inventory.cost_currency_note') }}</div>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item :label="$t('inventory.adjustment_account')" required>
                    <AccountPicker v-model="adjustment.adjustment_expense_account_guid" accountTypes="EXPENSE"
                        placeholder="Select Adjustment Account" :filterByCurrencyGuid="adjustment.currency_guid" />
                </el-form-item>

                <el-form-item :label="$t('inventory.notes')">
                    <el-input v-model="adjustment.notes" type="textarea" :rows="2" />
                </el-form-item>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'Inventory' })">{{ $t('cancel') }}</el-button>
                    <el-button type="primary" @click="handleSubmit" :loading="isLoading">
                        {{ isLoading ? $t('submitting') : $t('inventory.submit_adjustment') }}
                    </el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { adjustInventory } from '../../services/inventoryService';
import { parseApiError } from '../../utils/errorHandler';
import AccountPicker from '../../components/common/AccountPicker.vue';
import FormError from '../../components/common/FormError.vue';
import CommodityPicker from '../../components/common/CommodityPicker.vue';
import CurrencyPicker from '../../components/common/CurrencyPicker.vue';

const { t } = useI18n();
const router = useRouter();

const isLoading = ref(false);
const apiError = ref(null);

const adjustment = reactive({
    commodity_guid: '',
    currency_guid: '',
    adjustment_expense_account_guid: '',
    quantity_change: 0,
    cost_per_unit: 0,
    notes: ''
});

const onItemSelected = (item) => {
    if (item && item.valuation_currency_guid) {
        adjustment.currency_guid = item.valuation_currency_guid;
    }
};

watch(() => adjustment.currency_guid, (newCurrency, oldCurrency) => {
    if (newCurrency !== oldCurrency) {
        adjustment.adjustment_expense_account_guid = '';
    }
});

const handleSubmit = async () => {
    isLoading.value = true;
    apiError.value = null;
    try {
        await adjustInventory(adjustment);
        router.push({ name: 'Inventory' });
    } catch (err) {
        apiError.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.form-container {
    max-width: 800px;
    margin: 0 auto;
}

.form-help-text {
    font-size: 0.85rem;
    color: #909399;
    margin-top: 5px;
}

.mt-4 {
    margin-top: 20px;
}

.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>