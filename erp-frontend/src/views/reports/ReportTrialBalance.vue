<template>
    <el-card shadow="never">
        <template #header>
            <div class="report-header">
                <h2>{{ $t('reports.trial_balance') }}</h2>
                <el-form :inline="true" class="report-controls">
                    <el-form-item :label="$t('reports.as_of_date')">
                        <el-date-picker v-model="as_of_date" type="date" placeholder="Select Date" format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD" :clearable="false" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="fetchReport" :loading="isLoading" icon="Search">
                            {{ $t('reports.run_report') }}
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </template>

        <div v-if="error">
            <el-alert :title="$t('errors.load_failed')" type="error" show-icon :description="String(error)"
                class="mb-4" />
        </div>

        <el-table v-if="reportData" v-loading="isLoading" :data="reportData.accounts" border stripe show-summary
            :summary-method="getSummaries" style="width: 100%">
            <el-table-column prop="code" :label="$t('reports.account_code')" width="150" sortable />
            <el-table-column prop="name" :label="$t('reports.account_name')" min-width="200" />
            <el-table-column prop="balance" :label="`${$t('reports.balance')} (CNY)`" min-width="150" align="right">
                <template #default="scope">
                    <span :class="{ 'text-danger': scope.row.balance < 0 }">
                        {{ formatCurrency(scope.row.balance, 'CNY') }}
                    </span>
                </template>
            </el-table-column>
        </el-table>

        <el-empty v-else-if="!isLoading" description="请选择日期并运行报表" />
    </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getTrialBalance } from '../../services/reportService';
import { parseApiError } from '../../utils/errorHandler';
import { formatCurrency, getISODate } from '../../utils/formatters';

const { t } = useI18n();
const reportData = ref(null);
const isLoading = ref(false);
const error = ref(null);
const as_of_date = ref(getISODate());

const fetchReport = async () => {
    isLoading.value = true;
    error.value = null;
    reportData.value = null;

    try {
        const response = await getTrialBalance(as_of_date.value);
        reportData.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
};

// 自定义合计逻辑，使用后端返回的 total_balance
const getSummaries = (param) => {
    const { columns } = param;
    const sums = [];
    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = t('reports.total_balance_check');
            return;
        }
        if (column.property === 'balance') {
            sums[index] = formatCurrency(reportData.value.total_balance, 'CNY');
        } else {
            sums[index] = '';
        }
    });
    return sums;
};
</script>

<style lang="scss" scoped>
.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    h2 {
        margin: 0;
        font-size: 1.25rem;
    }
}

.report-controls {
    margin-bottom: 0;
}

.mb-4 {
    margin-bottom: 20px;
}

.text-danger {
    color: #F56C6C;
}
</style>