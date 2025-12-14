<template>
    <el-card shadow="never">
        <template #header>
            <div class="page-header">
                <h2>{{ $t('nav.ledger') }} (Chart of Accounts)</h2>
                <div class="button-group">
                    <el-button type="warning" icon="EditPen" v-if="authStore.hasRole(['admin', 'finance'])"
                        @click="$router.push({ name: 'CreateJournalEntry' })">
                        {{ $t('ledger.create_journal') }}
                    </el-button>
                    <el-button type="primary" icon="Plus" v-if="authStore.hasRole(['admin'])"
                        @click="$router.push({ name: 'AccountCreate' })">
                        {{ $t('ledger.create') }}
                    </el-button>
                </div>
            </div>
        </template>

        <div v-if="error">
            <el-alert :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
                class="mb-4" />
        </div>

        <el-table v-loading="isLoading" :data="accounts" border stripe style="width: 100%" row-key="guid"
            default-expand-all>
            <el-table-column prop="code" :label="$t('ledger.code')" width="120" sortable />
            <el-table-column prop="name" :label="$t('ledger.name')" min-width="200" sortable />
            <el-table-column prop="account_type" :label="$t('ledger.type')" width="150" sortable>
                <template #default="scope">
                    <el-tag :type="getAccountTypeTag(scope.row.account_type)">
                        {{ scope.row.account_type }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="placeholder" :label="$t('ledger.placeholder')" width="120" align="center">
                <template #default="scope">
                    <el-tag :type="scope.row.placeholder ? 'info' : ''" effect="plain">
                        {{ scope.row.placeholder ? 'Yes' : 'No' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column v-if="authStore.hasRole(['admin'])" :label="$t('ledger.actions')" width="120"
                align="center" fixed="right">
                <template #default="scope">
                    <el-button link type="primary" size="small" icon="Edit"
                        @click="$router.push({ name: 'AccountDetail', params: { guid: scope.row.guid } })">
                        {{ $t('edit') }}
                    </el-button>
                </template>
            </el-table-column>

            <template #empty>
                <el-empty description="No accounts found" />
            </template>
        </el-table>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAccounts } from '../../services/ledgerService';
import { parseApiError } from '../../utils/errorHandler';
import { useAuthStore } from '../../store/auth';

const { t } = useI18n();
const authStore = useAuthStore();
const accounts = ref([]);
const isLoading = ref(false);
const error = ref(null);

const getAccountTypeTag = (type) => {
    switch (type) {
        case 'ASSET': return 'success';
        case 'LIABILITY': return 'danger';
        case 'EQUITY': return 'info';
        case 'INCOME': return 'primary';
        case 'EXPENSE': return 'warning';
        case 'STOCK': return 'warning';
        default: return '';
    }
};

onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await getAccounts();
        accounts.value = response.data;
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