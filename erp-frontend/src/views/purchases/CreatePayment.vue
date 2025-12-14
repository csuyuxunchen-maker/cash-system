<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ $t('purchases.record_payment') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form ref="formRef" :model="payment" label-position="top" :disabled="isSubmitting">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('purchases.date')" required>
                            <el-date-picker v-model="payment.date" type="datetime" placeholder="Select date"
                                style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('purchases.amount')" required>
                            <el-input-number v-model="payment.amount" :min="0" :precision="2" :step="0.01"
                                style="width: 100%" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('vendors.currency')" required>
                            <CurrencyPicker v-model="payment.currency_guid" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('purchases.checking_account')" required>
                            <AccountPicker v-model="payment.checking_account_guid" accountTypes="ASSET"
                                :placeholder="$t('purchases.checking_account')"
                                :filterByCurrencyGuid="payment.currency_guid" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item :label="$t('purchases.vendor')" required>
                    <VendorPicker v-model="payment.vendor_guid" />
                </el-form-item>

                <el-form-item :label="$t('purchases.description')" required>
                    <el-input v-model="payment.description" />
                </el-form-item>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'PurchaseBillList' })">{{ $t('cancel') }}</el-button>
                    <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
                        {{ isSubmitting ? $t('submitting') : $t('purchases.record_payment') }}
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
import { createVendorPayment } from '../../services/purchaseService';
import { parseApiError } from '../../utils/errorHandler';
import { formatDateTimeForAPI } from '../../utils/formatters';
import AccountPicker from '../../components/common/AccountPicker.vue';
import CurrencyPicker from '../../components/common/CurrencyPicker.vue';
import VendorPicker from '../../components/common/VendorPicker.vue';
import FormError from '../../components/common/FormError.vue';

const { t } = useI18n();
const router = useRouter();

const isSubmitting = ref(false);
const apiError = ref(null);

const payment = reactive({
    date: new Date(),
    description: 'Vendor Payment',
    currency_guid: '',
    checking_account_guid: '',
    vendor_guid: '',
    amount: 0
});

watch(() => payment.currency_guid, (newCurrency, oldCurrency) => {
    if (newCurrency !== oldCurrency) {
        payment.checking_account_guid = '';
    }
});

const handleSubmit = async () => {
    isSubmitting.value = true;
    apiError.value = null;

    try {
        const apiPayload = {
            date: formatDateTimeForAPI(payment.date),
            description: payment.description,
            currency_guid: payment.currency_guid,
            checking_account_guid: payment.checking_account_guid,
            vendor_guid: payment.vendor_guid,
            amount: payment.amount
        };

        await createVendorPayment(apiPayload);
        router.push({ name: 'PurchaseBillList' });

    } catch (error) {
        console.error("Failed to create payment:", error);
        apiError.value = parseApiError(error) || error.message;
    } finally {
        isSubmitting.value = false;
    }
};
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