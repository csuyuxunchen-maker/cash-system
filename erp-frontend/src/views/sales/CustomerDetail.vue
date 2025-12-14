<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ isEditMode ? $t('customers.edit_title') : $t('customers.create_title') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form v-if="!isLoading" ref="formRef" :model="customer" label-position="top" :disabled="isSubmitting">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('customers.name')" required>
                            <el-input v-model="customer.name" placeholder="Enter customer name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('customers.id')" required>
                            <el-input v-model="customer.id" placeholder="e.g. CUST-001" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item :label="$t('customers.active')">
                    <el-switch v-model="customer.active" active-text="Yes" inactive-text="No" />
                </el-form-item>

                <el-form-item :label="$t('customers.notes')">
                    <el-input v-model="customer.notes" type="textarea" :rows="3" placeholder="Optional notes" />
                </el-form-item>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'CustomerList' })">{{ $t('cancel') }}</el-button>
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
import { getCustomer, createCustomer, updateCustomer } from '../../services/salesService';
import { parseApiError } from '../../utils/errorHandler';
import FormError from '../../components/common/FormError.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const guid = ref(route.params.guid || null);
const isEditMode = computed(() => !!guid.value);
const isLoading = ref(false);
const isSubmitting = ref(false);
const apiError = ref(null);

const customer = reactive({
    name: '',
    id: '',
    notes: '',
    active: true,
});

onMounted(async () => {
    if (isEditMode.value) {
        isLoading.value = true;
        apiError.value = null;
        try {
            const response = await getCustomer(guid.value);
            Object.assign(customer, response.data);
            // 确保 active 是布尔值，有时 API 返回 0/1
            customer.active = !!customer.active;
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
            const updatePayload = {
                name: customer.name,
                id: customer.id,
                notes: customer.notes,
                active: customer.active
            };
            await updateCustomer(guid.value, updatePayload);
        } else {
            await createCustomer(customer);
        }
        router.push({ name: 'CustomerList' });
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