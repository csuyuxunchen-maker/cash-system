<template>
    <el-card shadow="never">
        <template #header>
            <div class="report-header">
                <h2>{{ $t('reports.profit_loss') }}</h2>
                <el-form :inline="true" class="report-controls">
                    <el-form-item :label="$t('reports.start_date')">
                        <el-date-picker v-model="start_date" type="date" placeholder="Start Date"
                            value-format="YYYY-MM-DD" :clearable="false" />
                    </el-form-item>
                    <el-form-item :label="$t('reports.end_date')">
                        <el-date-picker v-model="end_date" type="date" placeholder="End Date" value-format="YYYY-MM-DD"
                            :clearable="false" />
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

        <div v-if="reportData" v-loading="isLoading" class="report-content">
            <el-divider content-position="left">
                <el-tag type="success" effect="dark">{{ $t('reports.income') }}</el-tag>
            </el-divider>
            <el-table :data="reportData.income_accounts" border stripe style="width: 100%" class="mb-4"
                :summary-method="() => getCustomSummary('income')" show-summary>
                <el-table-column prop="code" :label="$t('reports.account_code')" width="150" />
                <el-table-column prop="name" :label="$t('reports.account_name')" />
                <el-table-column prop="balance" label="Amount (CNY)" align="right" width="200">
                    <template #default="scope">
                        {{ formatCurrency(scope.row.balance, 'CNY') }}
                    </template>
                </el-table-column>
            </el-table>

            <el-divider content-position="left">
                <el-tag type="danger" effect="dark">{{ $t('reports.expense') }}</el-tag>
            </el-divider>
            <el-table :data="reportData.expense_accounts" border stripe style="width: 100%" class="mb-4"
                :summary-method="() => getCustomSummary('expense')" show-summary>
                <el-table-column prop="code" :label="$t('reports.account_code')" width="150" />
                <el-table-column prop="name" :label="$t('reports.account_name')" />
                <el-table-column prop="balance" label="Amount (CNY)" align="right" width="200">
                    <template #default="scope">
                        {{ formatCurrency(scope.row.balance, 'CNY') }}
                    </template>
                </el-table-column>
            </el-table>

            <div class="net-income-section">
                <el-descriptions border :column="1" size="large">
                    <el-descriptions-item :label="$t('reports.net_income')">
                        <span class="net-income-value" :class="netIncomeClass">
                            {{ formatCurrency(reportData.net_income, 'CNY') }}
                        </span>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </div>

        <el-empty v-else-if="!isLoading" description="请选择日期范围并运行报表" />
    </el-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getProfitLoss } from '../../services/reportService';
import { parseApiError } from '../../utils/errorHandler';
import { formatCurrency, getISODate } from '../../utils/formatters';

const { t } = useI18n();
const reportData = ref(null);
const isLoading = ref(false);
const error = ref(null);

const defaultStart = new Date(new Date().getFullYear(), 0, 1);
const start_date = ref(getISODate(defaultStart));
const end_date = ref(getISODate());

const netIncomeClass = computed(() => {
    if (!reportData.value) return '';
    return reportData.value.net_income >= 0 ? 'text-success' : 'text-danger';
});

const fetchReport = async () => {
    isLoading.value = true;
    error.value = null;
    reportData.value = null;

    try {
        const response = await getProfitLoss(start_date.value, end_date.value);
        reportData.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
};

const getCustomSummary = (type) => {
    const total = type === 'income' ? reportData.value.total_income : reportData.value.total_expense;
    const label = type === 'income' ? t('reports.total_income') : t('reports.total_expense');
    return [t('ledger.totals'), label, formatCurrency(total, 'CNY')];
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

.net-income-section {
    margin-top: 30px;
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 4px;
}

.net-income-value {
    font-size: 1.5rem;
    font-weight: bold;
}

.text-success {
    color: #67C23A;
}

.text-danger {
    color: #F56C6C;
}
</style>