<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ $t('purchases.create_bill') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form ref="formRef" :model="bill" label-position="top" :disabled="isLoading">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('purchases.vendor')" required>
                            <VendorPicker v-model="bill.vendor_guid" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('purchases.currency')" required>
                            <CurrencyPicker v-model="bill.currency_guid" @currenciesLoaded="allCurrencies = $event" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('purchases.date')" required>
                            <el-date-picker v-model="bill.date_opened" type="datetime" placeholder="Select date"
                                style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('purchases.notes')">
                            <el-input v-model="bill.notes" placeholder="Optional notes" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-divider content-position="left">{{ $t('purchases.line_items') }}</el-divider>

                <el-table :data="bill.line_items" border style="width: 100%" class="mb-4">
                    <el-table-column :label="$t('sales.item') + ' / ' + $t('purchases.description')" min-width="250">
                        <template #default="{ row }">
                            <div class="item-input-group">
                                <el-checkbox v-model="row.isStockItem" class="item-type-checkbox">
                                    {{ $t('inventory.is_stock_item') }}
                                </el-checkbox>

                                <CommodityPicker v-if="row.isStockItem" v-model="row.commodity_guid"
                                    placeholder="Select Stock Item" />
                                <el-input v-else v-model="row.description" placeholder="Enter description" />
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column :label="$t('purchases.expense_account')" min-width="220">
                        <template #default="{ row }">
                            <AccountPicker v-if="row.isStockItem" v-model="row.asset_or_expense_account_guid"
                                :accountTypes="['STOCK']" placeholder="Select Stock Account"
                                :filterByCommodityGuid="row.commodity_guid"
                                :filterByCurrencyGuid="bill.currency_guid" />

                            <AccountPicker v-if="!row.isStockItem" v-model="row.asset_or_expense_account_guid"
                                :accountTypes="['EXPENSE', 'ASSET']" placeholder="Select Expense/Asset Account"
                                :filterByCurrencyGuid="bill.currency_guid" />
                        </template>
                    </el-table-column>

                    <el-table-column :label="$t('purchases.quantity')" width="130">
                        <template #default="{ row }">
                            <el-input-number v-model="row.quantity" :min="0" :step="1" style="width: 100%"
                                :controls="false" />
                        </template>
                    </el-table-column>

                    <el-table-column :label="$t('purchases.price')" width="130">
                        <template #default="{ row }">
                            <el-input-number v-model="row.price" :min="0" :precision="2" :step="0.01"
                                style="width: 100%" :controls="false" />
                        </template>
                    </el-table-column>

                    <el-table-column label="Total" width="120" align="right">
                        <template #default="{ row }">
                            {{ formatCurrency(row.quantity * row.price, selectedCurrencyMnemonic) }}
                        </template>
                    </el-table-column>

                    <el-table-column width="60" align="center">
                        <template #default="{ $index }">
                            <el-button type="danger" icon="Delete" circle size="small" @click="removeLineItem($index)"
                                :disabled="bill.line_items.length <= 1" />
                        </template>
                    </el-table-column>
                </el-table>

                <div class="actions-bar">
                    <el-button @click="addLineItem" icon="Plus">
                        {{ $t('purchases.add_line') }}
                    </el-button>

                    <div class="total-display">
                        <span>Total: </span>
                        <span class="amount">{{ formatCurrency(totalAmount, selectedCurrencyMnemonic) }}</span>
                    </div>
                </div>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'PurchaseBillList' })">{{ $t('cancel') }}</el-button>
                    <el-button type="primary" @click="handleSubmit" :loading="isLoading">
                        {{ isLoading ? $t('submitting') : $t('purchases.create_bill_btn') }}
                    </el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { createPurchaseBill } from '../../services/purchaseService';
import { parseApiError } from '../../utils/errorHandler';
import { formatCurrency, formatDateTimeForAPI } from '../../utils/formatters';
import AccountPicker from '../../components/common/AccountPicker.vue';
import VendorPicker from '../../components/common/VendorPicker.vue';
import FormError from '../../components/common/FormError.vue';
import CommodityPicker from '../../components/common/CommodityPicker.vue';
import CurrencyPicker from '../../components/common/CurrencyPicker.vue';

const { t } = useI18n();
const router = useRouter();

const isLoading = ref(false);
const apiError = ref(null);
const allCurrencies = ref([]);

const bill = reactive({
    vendor_guid: '',
    currency_guid: '',
    date_opened: new Date(),
    notes: '',
    line_items: [
        {
            isStockItem: false,
            commodity_guid: null,
            description: '',
            asset_or_expense_account_guid: '',
            quantity: 1,
            price: 0
        }
    ]
});

watch(() => bill.currency_guid, (newCurrency, oldCurrency) => {
    if (newCurrency !== oldCurrency) {
        bill.line_items.forEach(item => {
            item.asset_or_expense_account_guid = '';
        });
    }
});

const selectedCurrencyMnemonic = computed(() => {
    if (!bill.currency_guid || allCurrencies.value.length === 0) return 'USD';
    const currency = allCurrencies.value.find(c => c.guid === bill.currency_guid);
    return currency ? currency.mnemonic : 'USD';
});

const totalAmount = computed(() => {
    return bill.line_items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
});

const addLineItem = () => {
    bill.line_items.push({
        isStockItem: false,
        commodity_guid: null,
        description: '',
        asset_or_expense_account_guid: '',
        quantity: 1,
        price: 0
    });
};

const removeLineItem = (index) => {
    if (bill.line_items.length > 1) {
        bill.line_items.splice(index, 1);
    }
};

const handleSubmit = async () => {
    isLoading.value = true;
    apiError.value = null;

    try {
        const apiPayload = {
            vendor_guid: bill.vendor_guid,
            currency_guid: bill.currency_guid,
            date_opened: formatDateTimeForAPI(bill.date_opened),
            notes: bill.notes,
            line_items: bill.line_items.map(item => ({
                isStockItem: item.isStockItem,
                commodity_guid: item.isStockItem ? item.commodity_guid : null,
                description: item.isStockItem ? '' : item.description,
                asset_or_expense_account_guid: item.asset_or_expense_account_guid,
                quantity: item.quantity,
                price: item.price
            }))
        };

        await createPurchaseBill(apiPayload);
        router.push({ name: 'PurchaseBillList' });

    } catch (error) {
        console.error("Failed to create bill:", error);
        apiError.value = parseApiError(error) || error.message;
    } finally {
        isLoading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.form-container {
    max-width: 1100px;
    margin: 0 auto;
}

.item-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.item-type-checkbox {
    margin-bottom: 0;
}

.actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.total-display {
    font-size: 1.2rem;
    font-weight: bold;

    .amount {
        color: #409EFF;
    }
}

.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.mb-4 {
    margin-bottom: 20px;
}

.mt-4 {
    margin-top: 20px;
}
</style>