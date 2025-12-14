<template>
    <el-alert v-if="error" :title="title" type="error" show-icon :closable="false" class="mb-4">
        <template #default>
            <div v-if="typeof error === 'string'">{{ error }}</div>
            <ul v-if="Array.isArray(error)" class="error-list">
                <li v-for="(err, index) in error" :key="index">
                    {{ err.path }}: {{ err.msg }}
                </li>
            </ul>
        </template>
    </el-alert>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    error: [String, Array]
});

const { t } = useI18n();
const title = computed(() => t('errors.generic'));
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1.5rem;
}

.error-list {
    margin: 0;
    padding-left: 1.2rem;
}
</style>