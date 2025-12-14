<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ isEditMode ? $t('vendors.edit_title') : $t('vendors.create_title') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form v-if="!isLoading" ref="formRef" :model="vendor" label-position="top" :disabled="isSubmitting">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('vendors.name')" required>
                            <el-input v-model="vendor.name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('vendors.id')" required>
                            <el-input v-model="vendor.id" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item :label="$t('vendors.active')">
                    <el-switch v-model="vendor.active" active-text="Yes" inactive-text="No" />
                </el-form-item>

                <el-form-item :label="$t('vendors.notes')">
                    <el-input v-model="vendor.notes" type="textarea" :rows="3" />
                </el-form-item>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'VendorList' })">{{ $t('cancel') }}</el-button>
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
import { getVendor, createVendor, updateVendor } from '../../services/purchaseService';
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

const vendor = reactive({
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
            const response = await getVendor(guid.value);
            Object.assign(vendor, response.data);
            // 确保 active 是布尔值
            vendor.active = !!vendor.active;
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
                name: vendor.name,
                id: vendor.id,
                notes: vendor.notes,
                active: vendor.active
            };
            await updateVendor(guid.value, updatePayload);
        } else {
            await createVendor(vendor);
        }
        router.push({ name: 'VendorList' });
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