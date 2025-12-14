<template>
    <div class="reports-dashboard">
        <div class="page-header mb-4">
            <h2>{{ $t('nav.reports') }}</h2>
        </div>

        <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
                <el-card shadow="hover" class="report-card" @click="$router.push({ name: 'ReportTrialBalance' })">
                    <div class="card-content">
                        <el-icon class="report-icon" :size="40">
                            <ScaleToOriginal />
                        </el-icon>
                        <h3>{{ $t('reports.trial_balance') }}</h3>
                        <p class="description">查看所有账户在特定日期的借贷余额。</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="8">
                <el-card shadow="hover" class="report-card" @click="$router.push({ name: 'ReportProfitLoss' })">
                    <div class="card-content">
                        <el-icon class="report-icon" :size="40">
                            <Money />
                        </el-icon>
                        <h3>{{ $t('reports.profit_loss') }}</h3>
                        <p class="description">查看特定期间内的收入、费用和净利润。</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="8">
                <el-card shadow="hover" class="report-card" @click="$router.push({ name: 'ReportBalanceSheet' })">
                    <div class="card-content">
                        <el-icon class="report-icon" :size="40">
                            <OfficeBuilding />
                        </el-icon>
                        <h3>{{ $t('reports.balance_sheet') }}</h3>
                        <p class="description">查看特定日期的资产、负债和所有者权益。</p>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
// 图标组件应在 main.js 中全局注册或在此处引入
</script>

<style lang="scss" scoped>
.page-header {
    h2 {
        margin: 0;
        color: #303133;
    }
}

.report-card {
    cursor: pointer;
    transition: transform 0.2s;
    height: 100%;

    &:hover {
        transform: translateY(-5px);
    }

    .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 20px;

        .report-icon {
            color: #409EFF;
            margin-bottom: 15px;
        }

        h3 {
            margin: 0 0 10px 0;
            color: #303133;
        }

        .description {
            margin: 0;
            color: #909399;
            font-size: 0.9rem;
        }
    }
}

.mb-4 {
    margin-bottom: 20px;
}
</style>