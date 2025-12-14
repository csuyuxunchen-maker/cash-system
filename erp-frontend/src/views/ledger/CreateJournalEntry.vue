<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ $t('ledger.create_journal') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form ref="formRef" :model="entry" label-position="top" :disabled="isSubmitting">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('sales.date')" required>
                            <el-date-picker v-model="entry.date" type="datetime" placeholder="Select date"
                                style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('customers.currency')" required>
                            <CurrencyPicker v-model="entry.currency_guid" @currenciesLoaded="allCurrencies = $event" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item :label="$t('sales.description')" required>
                    <el-input v-model="entry.description" placeholder="Enter description" />
                </el-form-item>

                <el-divider content-position="left">{{ $t('ledger.splits') }}</el-divider>

                <el-table :data="entry.splits" border style="width: 100%" class="mb-4">
                    <el-table-column :label="$t('ledger.account')" min-width="250">
                        <template #default="{ row }">
                            <AccountPicker v-model="row.account_guid"
                                :accountTypes="['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'STOCK']"
                                placeholder="Select Account" :filterByCurrencyGuid="entry.currency_guid"
                                @accountsLoaded="onAccountsLoaded" />
                        </template>
                    </el-table-column>

                    <el-table-column :label="$t('ledger.memo')" min-width="180">
                        <template #default="{ row }">
                            <el-input v-model="row.memo" placeholder="Optional memo" />
                        </template>
                    </el-table-column>

                    <el-table-column :label="$t('ledger.debit')" width="150">
                        <template #default="{ row, $index }">
                            <el-input-number v-model="row.debit" :min="0" :precision="2" :step="0.01"
                                style="width: 100%" :controls="false" @change="updateSplit('debit', $index)"
                                :disabled="row.credit > 0" />
                        </template>
                    </el-table-column>

                    <el-table-column :label="$t('ledger.credit')" width="150">
                        <template #default="{ row, $index }">
                            <el-input-number v-model="row.credit" :min="0" :precision="2" :step="0.01"
                                style="width: 100%" :controls="false" @change="updateSplit('credit', $index)"
                                :disabled="row.debit > 0" />
                        </template>
                    </el-table-column>

                    <el-table-column width="60" align="center">
                        <template #default="{ $index }">
                            <el-button type="danger" icon="Delete" circle size="small" @click="removeLineItem($index)"
                                :disabled="entry.splits.length <= 2" />
                        </template>
                    </el-table-column>
                </el-table>

                <div class="actions-bar">
                    <el-button @click="addLineItem" icon="Plus">
                        {{ $t('sales.add_line') }}
                    </el-button>

                    <div class="summary-box">
                        <div class="summary-row">
                            <span>Debit: </span>
                            <span>{{ formatCurrency(totalDebit, selectedCurrencyMnemonic) }}</span>
                        </div>
                        <div class="summary-row">
                            <span>Credit: </span>
                            <span>{{ formatCurrency(totalCredit, selectedCurrencyMnemonic) }}</span>
                        </div>
                        <div class="balance-status"
                            :class="{ 'text-success': isBalanced, 'text-danger': !isBalanced || isCurrencyMismatched }">
                            <span v-if="isCurrencyMismatched">{{ $t('ledger.currency_mismatch') }}</span>
                            <span v-else>{{ isBalanced ? $t('ledger.balanced') : $t('ledger.unbalanced') }}</span>
                        </div>
                    </div>
                </div>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'AccountList' })">{{ $t('cancel') }}</el-button>
                    <el-button type="primary" @click="handleSubmit"
                        :disabled="!isBalanced || isCurrencyMismatched || isSubmitting" :loading="isSubmitting">
                        {{ isSubmitting ? $t('submitting') : $t('ledger.post_entry') }}
                    </el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { createJournalEntry, getAccounts } from '../../services/ledgerService';
import { parseApiError } from '../../utils/errorHandler';
import { formatCurrency, formatDateTimeForAPI } from '../../utils/formatters';
import AccountPicker from '../../components/common/AccountPicker.vue';
import CurrencyPicker from '../../components/common/CurrencyPicker.vue';
import FormError from '../../components/common/FormError.vue';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const router = useRouter();

const isSubmitting = ref(false);
const apiError = ref(null);
const allAccounts = ref([]);
const allCurrencies = ref([]);

const entry = reactive({
    date: new Date(),
    description: '',
    currency_guid: '',
    splits: [
        { account_guid: '', memo: '', debit: 0, credit: 0, value: 0 },
        { account_guid: '', memo: '', debit: 0, credit: 0, value: 0 }
    ]
});

async function onAccountsLoaded(accountsData) {
    if (allAccounts.value.length === 0) {
        allAccounts.value = accountsData;
    }
}

onMounted(async () => {
    try {
        if (allAccounts.value.length === 0) {
            const response = await getAccounts();
            allAccounts.value = response.data;
        }
    } catch (e) {
        console.error("Failed to preload accounts:", e);
    }
});

const totalDebit = computed(() => entry.splits.reduce((sum, s) => sum + (s.debit || 0), 0));
const totalCredit = computed(() => entry.splits.reduce((sum, s) => sum + (s.credit || 0), 0));
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.001 && totalDebit.value > 0);

const selectedCurrencyMnemonic = computed(() => {
    if (!entry.currency_guid || allCurrencies.value.length === 0) {
        return 'USD';
    }
    const currency = allCurrencies.value.find(c => c.guid === entry.currency_guid);
    return currency ? currency.mnemonic : 'USD';
});

const isCurrencyMismatched = computed(() => {
    if (!entry.currency_guid || allAccounts.value.length === 0) {
        return false;
    }
    for (const split of entry.splits) {
        if (split.account_guid) {
            const account = allAccounts.value.find(a => a.guid === split.account_guid);
            if (account && account.commodity_guid !== entry.currency_guid) {
                return true;
            }
        }
    }
    return false;
});

watch(() => entry.currency_guid, (newCurrency, oldCurrency) => {
    if (newCurrency !== oldCurrency && oldCurrency) {
        ElMessage.warning(t('ledger.accounts_reset'));
        entry.splits.forEach(split => {
            split.account_guid = '';
            split.debit = 0;
            split.credit = 0;
            split.value = 0;
        });
    }
});

const addLineItem = () => {
    entry.splits.push({ account_guid: '', memo: '', debit: 0, credit: 0, value: 0 });
};

const removeLineItem = (index) => {
    if (entry.splits.length > 2) {
        entry.splits.splice(index, 1);
    }
};

const updateSplit = (type, index) => {
    const split = entry.splits[index];
    const val = type === 'debit' ? (split.debit || 0) : (split.credit || 0);

    if (type === 'debit' && val > 0) {
        split.credit = 0;
        split.value = val;
    } else if (type === 'credit' && val > 0) {
        split.debit = 0;
        split.value = -val;
    } else {
        split.value = 0;
        if (type === 'debit') split.debit = 0;
        if (type === 'credit') split.credit = 0;
    }
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    apiError.value = null;

    if (!isBalanced.value) {
        apiError.value = t('ledger.must_balance');
        isSubmitting.value = false;
        return;
    }
    if (isCurrencyMismatched.value) {
        apiError.value = t('ledger.currency_mismatch');
        isSubmitting.value = false;
        return;
    }

    try {
        const apiPayload = {
            date: formatDateTimeForAPI(entry.date),
            description: entry.description,
            currency_guid: entry.currency_guid,
            splits: entry.splits
                .filter(s => s.value !== 0)
                .map(s => ({
                    account_guid: s.account_guid,
                    memo: s.memo,
                    value: s.value
                }))
        };

        if (apiPayload.splits.length < 2) {
            throw new Error(t('ledger.must_have_splits'));
        }

        await createJournalEntry(apiPayload);
        router.push({ name: 'AccountList' });

    } catch (error) {
        console.error("Failed to create journal entry:", error);
        apiError.value = parseApiError(error) || error.message;
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style lang="scss" scoped>
.form-container {
    max-width: 1000px;
    margin: 0 auto;
}

.card-header {
    h2 {
        margin: 0;
        font-size: 1.25rem;
    }
}

.actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 15px;
}

.summary-box {
    text-align: right;
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    min-width: 250px;

    .summary-row {
        margin-bottom: 5px;
        font-size: 1.1rem;
        display: flex;
        justify-content: space-between;
    }

    .balance-status {
        margin-top: 10px;
        font-weight: bold;
        font-size: 1.1rem;
        border-top: 1px solid #ddd;
        padding-top: 5px;
    }
}

.text-success {
    color: #67C23A;
}

.text-danger {
    color: #F56C6C;
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