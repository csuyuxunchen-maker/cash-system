<template>
    <el-card shadow="never">
        <template #header>
            <div class="report-header">
                <h2>{{ $t('reports.balance_sheet') }}</h2>
                <el-form :inline="true" class="report-controls">
                    <el-form-item :label="$t('reports.as_of_date')">
                        <el-date-picker v-model="as_of_date" type="date" placeholder="Select Date"
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

        <div v-if="reportData" v-loading="isLoading" class="report-content">
            <el-divider content-position="left">
                <el-tag type="primary" effect="dark">{{ $t('reports.assets') }}</el-tag>
            </el-divider>
            <el-table :data="reportData.assets.accounts" border stripe style="width: 100%" class="mb-4" show-summary
                :summary-method="() => getSummary('assets')">
                <el-table-column prop="code" :label="$t('reports.account_code')" width="150" />
                <el-table-column prop="name" :label="$t('reports.account_name')" />
                <el-table-column prop="balance" label="Amount (CNY)" align="right" width="200">
                    <template #default="scope">
                        {{ formatCurrency(scope.row.balance, 'CNY') }}
                    </template>
                </el-table-column>
            </el-table>

            <el-divider content-position="left">
                <el-tag type="warning" effect="dark">{{ $t('reports.liabilities') }}</el-tag>
            </el-divider>
            <el-table :data="reportData.liabilities.accounts" border stripe style="width: 100%" class="mb-4"
                show-summary :summary-method="() => getSummary('liabilities')">
                <el-table-column prop="code" :label="$t('reports.account_code')" width="150" />
                <el-table-column prop="name" :label="$t('reports.account_name')" />
                <el-table-column prop="balance" label="Amount (CNY)" align="right" width="200">
                    <template #default="scope">
                        {{ formatCurrency(scope.row.balance, 'CNY') }}
                    </template>
                </el-table-column>
            </el-table>

            <el-divider content-position="left">
                <el-tag type="info" effect="dark">{{ $t('reports.equity') }}</el-tag>
            </el-divider>
            <el-table :data="equityAccountsWithNetIncome" border stripe style="width: 100%" class="mb-4" show-summary
                :summary-method="() => getSummary('equity')">
                <el-table-column prop="code" :label="$t('reports.account_code')" width="150" />
                <el-table-column prop="name" :label="$t('reports.account_name')" />
                <el-table-column prop="balance" label="Amount (CNY)" align="right" width="200">
                    <template #default="scope">
                        {{ formatCurrency(scope.row.balance, 'CNY') }}
                    </template>
                </el-table-column>
            </el-table>

            <div class="balance-check-section">
                <el-alert v-if="Math.abs(reportData.check_balance) < 0.01" :title="$t('reports.balanced')"
                    type="success" show-icon :closable="false">
                    {{ $t('reports.balance_check') }}: {{ formatCurrency(reportData.check_balance, 'CNY') }}
                </el-alert>
                <el-alert v-else :title="$t('reports.unbalanced')" type="error" show-icon :closable="false">
                    {{ $t('reports.balance_check') }}: {{ formatCurrency(reportData.check_balance, 'CNY') }}
                </el-alert>

                <div class="total-summary mt-3">
                    <strong>{{ $t('reports.total_liabilities_equity') }}: </strong>
                    <span>{{ formatCurrency(reportData.total_liabilities_and_equity, 'CNY') }}</span>
                </div>
            </div>
        </div>

        <el-empty v-else-if="!isLoading" description="请选择日期并运行报表" />
    </el-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getBalanceSheet } from '../../services/reportService';
import { parseApiError } from '../../utils/errorHandler';
import { formatCurrency, getISODate } from '../../utils/formatters';

const { t } = useI18n();
const reportData = ref(null);
const isLoading = ref(false);
const error = ref(null);
const as_of_date = ref(getISODate());

// 计算属性：将净利润添加到权益列表以便显示
const equityAccountsWithNetIncome = computed(() => {
    if (!reportData.value) return [];
    const accounts = [...reportData.value.equity.accounts];
    // 只有当净利润不为0时才显示
    if (reportData.value.equity.net_income !== 0) {
        accounts.push({
            guid: 'net-income-placeholder',
            code: '',
            name: t('reports.net_income'),
            balance: reportData.value.equity.net_income
        });
    }
    return accounts;
});

const fetchReport = async () => {
    isLoading.value = true;
    error.value = null;
    reportData.value = null;

    try {
        const response = await getBalanceSheet(as_of_date.value);
        reportData.value = response.data;
    } catch (err) {
        error.value = parseApiError(err);
    } finally {
        isLoading.value = false;
    }
};

const getSummary = (type) => {
    const total = reportData.value[type].total;
    const labelKey = `reports.total_${type}`;
    return [t('ledger.totals'), t(labelKey), formatCurrency(total, 'CNY')];
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

.mt-3 {
    margin-top: 15px;
}

.balance-check-section {
    margin-top: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.total-summary {
    font-size: 1.1rem;
    text-align: right;
}
</style>