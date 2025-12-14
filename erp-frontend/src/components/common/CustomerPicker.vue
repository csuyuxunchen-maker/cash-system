<template>
    <el-select :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)"
        :placeholder="placeholder" :loading="isLoading" filterable clearable class="w-100">
        <el-option v-for="customer in customers" :key="customer.guid" :label="`${customer.name} (${customer.id})`"
            :value="customer.guid" />
    </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCustomers } from '../../services/salesService';

defineProps({
    modelValue: String,
    placeholder: {
        type: String,
        default: 'Select a customer'
    }
});
defineEmits(['update:modelValue']);

const customers = ref([]);
const isLoading = ref(false);

onMounted(async () => {
    isLoading.value = true;
    try {
        const response = await getCustomers();
        customers.value = response.data;
    } catch (error) {
        console.error("Failed to load customers:", error);
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