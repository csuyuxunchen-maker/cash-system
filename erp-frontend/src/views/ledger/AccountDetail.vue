<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ isEditMode ? $t('ledger.edit_title') : $t('ledger.create_title') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form v-if="!isLoading" ref="formRef" :model="account" label-position="top" :disabled="isSubmitting">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('ledger.name')" required>
                            <el-input v-model="account.name" placeholder="Account Name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('ledger.code')">
                            <el-input v-model="account.code" placeholder="Optional Code" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('ledger.type')" required>
                            <el-select v-model="account.account_type" placeholder="Select Type" style="width: 100%">
                                <el-option label="ASSET" value="ASSET" />
                                <el-option label="LIABILITY" value="LIABILITY" />
                                <el-option label="EQUITY" value="EQUITY" />
                                <el-option label="INCOME" value="INCOME" />
                                <el-option label="EXPENSE" value="EXPENSE" />
                                <el-option label="STOCK" value="STOCK" />
                                <el-option label="CURRENCY" value="CURRENCY" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('ledger.currency')" required>
                            <CurrencyPicker v-model="account.commodity_guid" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('ledger.parent')">
                            <AccountPicker v-model="account.parent_guid"
                                :accountTypes="['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']"
                                :selectableOnly="false" placeholder="Select Parent (optional)" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('ledger.placeholder')">
                            <el-switch v-model="account.placeholder" active-text="Yes" inactive-text="No" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'AccountList' })">{{ $t('cancel') }}</el-button>
                    <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
                        {{ isSubmitting ? $t('submitting') : $t('save') }}
                    </el-button>
                </div>
            </el-form>

            <div v-if="isLoading" class="loading-wrapper">
                <el-skeleton :rows="5" animated />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getAccount, createAccount, updateAccount } from '../../services/ledgerService';
import { parseApiError } from '../../utils/errorHandler';
import FormError from '../../components/common/FormError.vue';
import CurrencyPicker from '../../components/common/CurrencyPicker.vue';
import AccountPicker from '../../components/common/AccountPicker.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const guid = ref(route.params.guid || null);
const isEditMode = computed(() => !!guid.value);
const isLoading = ref(false);
const isSubmitting = ref(false);
const apiError = ref(null);

const account = reactive({
    name: '',
    code: '',
    account_type: 'EXPENSE',
    commodity_guid: '',
    parent_guid: null,
    placeholder: false
});

onMounted(async () => {
    if (isEditMode.value) {
        isLoading.value = true;
        apiError.value = null;
        try {
            const response = await getAccount(guid.value);
            const data = response.data;
            data.placeholder = !!data.placeholder;
            Object.assign(account, data);
        } catch (err) {
            apiError.value = parseApiError(err);
        } finally {
            isLoading.value = false;
        }
    }
});

async function handleSubmit() {
    isSubmitting.value = true;
    apiError.value = null;
    try {
        if (isEditMode.value) {
            await updateAccount(guid.value, account);
        } else {
            await createAccount(account);
        }
        router.push({ name: 'AccountList' });
    } catch (err) {
        apiError.value = parseApiError(err);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style lang="scss" scoped>
.form-container {
    max-width: 800px;
    margin: 0 auto;
}

.card-header {
    h2 {
        margin: 0;
        font-size: 1.25rem;
    }
}

.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.mt-4 {
    margin-top: 20px;
}
</style>