<template>
    <el-card shadow="never">
        <template #header>
            <div class="page-header">
                <h2>{{ $t('nav.vendors') }}</h2>
                <el-button v-if="authStore.hasRole(['admin'])" type="primary" icon="Plus"
                    @click="$router.push({ name: 'VendorCreate' })">
                    {{ $t('vendors.create') }}
                </el-button>
            </div>
        </template>

        <div v-if="error">
            <el-alert :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
                class="mb-4" />
        </div>

        <el-table v-loading="isLoading" :data="vendors" border stripe style="width: 100%">
            <el-table-column prop="name" :label="$t('vendors.name')" min-width="150" sortable />
            <el-table-column prop="id" :label="$t('vendors.id')" width="150" sortable />
            <el-table-column prop="active" :label="$t('vendors.active')" width="100" align="center">
                <template #default="scope">
                    <el-tag :type="scope.row.active ? 'success' : 'danger'">
                        {{ scope.row.active ? 'Yes' : 'No' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column v-if="authStore.hasRole(['admin'])" :label="$t('vendors.actions')" width="180"
                align="center" fixed="right">
                <template #default="scope">
                    <el-button-group>
                        <el-button size="small" icon="Edit"
                            @click="$router.push({ name: 'VendorDetail', params: { guid: scope.row.guid } })">
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
                <el-empty description="暂无供应商数据" />
            </template>
        </el-table>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getVendors, deleteVendor } from '../../services/purchaseService';
import { parseApiError } from '../../utils/errorHandler';
import { useAuthStore } from '../../store/auth';
import { ElMessageBox, ElMessage } from 'element-plus';

const { t } = useI18n();
const authStore = useAuthStore();
const vendors = ref([]);
const isLoading = ref(false);
const error = ref(null);

async function fetchVendors() {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await getVendors();
        vendors.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
}

const handleDelete = (guid, name) => {
    ElMessageBox.confirm(
        t('vendors.confirm_delete', { name: name }),
        'Warning',
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                await deleteVendor(guid);
                ElMessage.success('Deleted successfully');
                await fetchVendors();
            } catch (err) {
                ElMessage.error(t('errors.delete_failed') + ': ' + parseApiError(err));
            }
        })
        .catch(() => { });
}

onMounted(fetchVendors);
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