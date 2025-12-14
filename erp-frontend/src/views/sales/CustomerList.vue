<template>
    <el-card shadow="never">
        <template #header>
            <div class="page-header">
                <h2>{{ $t('nav.customers') }}</h2>
                <el-button v-if="authStore.hasRole(['admin'])" type="primary" icon="Plus"
                    @click="$router.push({ name: 'CustomerCreate' })">
                    {{ $t('customers.create') }}
                </el-button>
            </div>
        </template>

        <div v-if="error">
            <el-alert :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
                class="mb-4" />
        </div>

        <el-table v-loading="isLoading" :data="customers" border stripe style="width: 100%">
            <el-table-column prop="name" :label="$t('customers.name')" min-width="150" sortable />
            <el-table-column prop="id" :label="$t('customers.id')" width="150" sortable />
            <el-table-column prop="active" :label="$t('customers.active')" width="100" align="center">
                <template #default="scope">
                    <el-tag :type="scope.row.active ? 'success' : 'danger'">
                        {{ scope.row.active ? 'Yes' : 'No' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column v-if="authStore.hasRole(['admin'])" :label="$t('customers.actions')" width="180"
                align="center" fixed="right">
                <template #default="scope">
                    <el-button-group>
                        <el-button size="small" icon="Edit"
                            @click="$router.push({ name: 'CustomerDetail', params: { guid: scope.row.guid } })">
                            {{ $t('edit') }}
                        </el-button>
                        <el-button size="small" type="danger" icon="Delete"
                            @click="handleDelete(scope.row.guid, scope.row.name)">
                            {{ $t('delete') }}
                        </el-button>
                    </el-button-group>
                </template>
            </el-table-column>

            <template #empty>
                <el-empty description="No customers found" />
            </template>
        </el-table>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCustomers, deleteCustomer } from '../../services/salesService';
import { parseApiError } from '../../utils/errorHandler';
import { useAuthStore } from '../../store/auth';
import { ElMessageBox, ElMessage } from 'element-plus';

const { t } = useI18n();
const authStore = useAuthStore();
const customers = ref([]);
const isLoading = ref(false);
const error = ref(null);

async function fetchCustomers() {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await getCustomers();
        customers.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
}

async function handleDelete(guid, name) {
    ElMessageBox.confirm(
        t('customers.confirm_delete', { name: name }),
        'Warning',
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    ).then(async () => {
        try {
            await deleteCustomer(guid);
            ElMessage.success('Deleted successfully');
            await fetchCustomers();
        } catch (err) {
            ElMessage.error(t('errors.delete_failed') + ': ' + parseApiError(err));
        }
    }).catch(() => { });
}

onMounted(fetchCustomers);
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

.mb-4 {
    margin-bottom: 20px;
}
</style>