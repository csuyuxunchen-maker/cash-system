<template>
    <el-select :model-value="modelValue" @update:model-value="handleChange" :placeholder="placeholder"
        :loading="isLoading" filterable class="w-100">
        <el-option v-for="currency in currencies" :key="currency.guid"
            :label="`${currency.mnemonic} (${currency.fullname})`" :value="currency.guid" />
    </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCurrencies } from '../../services/commoditiesService';

const props = defineProps({
    modelValue: String,
    placeholder: {
        type: String,
        default: 'Select a currency'
    }
});
const emit = defineEmits(['update:modelValue', 'currenciesLoaded']);

const currencies = ref([]);
const isLoading = ref(false);

const handleChange = (val) => {
    emit('update:modelValue', val);
};

onMounted(async () => {
    isLoading.value = true;
    try {
        const response = await getCurrencies();
        currencies.value = response.data;
        emit('currenciesLoaded', currencies.value);
    } catch (error) {
        console.error("Failed to load currencies:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
.w-100 {
    width: 100%;
}
</style>