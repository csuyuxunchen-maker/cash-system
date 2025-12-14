<template>
    <div class="form-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <h2>{{ $t('inventory.create_item') }}</h2>
                </div>
            </template>

            <FormError :error="apiError" />

            <el-form :model="item" label-position="top">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item :label="$t('inventory.item_name')" required>
                            <el-input v-model="item.fullname" placeholder="e.g., Wireless Mouse" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="`${$t('inventory.mnemonic')} (SKU)`" required>
                            <el-input v-model="item.mnemonic" placeholder="e.g., WM-001" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-alert type="info" :closable="false" show-icon class="mt-2">
                    <template #default>
                        {{ $t('inventory.create_help_multicurrency') || 'This wil(USD, CNY, EUR, JPY).' }}
                    </template>
                </el-alert>

                <div class="form-footer mt-4">
                    <el-button @click="$router.push({ name: 'Inventory' })">{{ $t('cancel') }}</el-button>
                    <el-button type="primary" @click="handleSubmit" :loading="isLoading">
                        {{ isLoading ? $t('submitting') : $t('inventory.create_item_btn') }}
                    </el-button>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { createStockItem } from '../../services/commoditiesService';
import { parseApiError } from '../../utils/errorHandler';
import FormError from '../../components/common/FormError.vue';

const { t } = useI18n();
const router = useRouter();

const isLoading = ref(false);
const apiError = ref(null);

const item = reactive({
    fullname: '',
    mnemonic: ''
    // 移除 parent_inventory_account_guid，因为现在是自动多币种创建
});

const handleSubmit = async () => {
    isLoading.value = true;
    apiError.value = null;
    try {
        await createStockItem(item);
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

.mt-2 {
    margin-top: 10px;
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