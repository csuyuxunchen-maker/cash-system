<template>
    <el-select :model-value="modelValue" @update:model-value="handleChange" :placeholder="placeholder"
        :loading="isLoading" filterable clearable class="w-100">
        <el-option v-for="item in items" :key="item.guid" :label="`${item.mnemonic} (${item.fullname})`"
            :value="item.guid" />
    </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStockItems } from '../../services/inventoryService';

const props = defineProps({
    modelValue: String,
    placeholder: {
        type: String,
        default: 'Select an item'
    }
});
const emit = defineEmits(['update:modelValue', 'itemSelected']);

const items = ref([]);
const isLoading = ref(false);

const handleChange = (val) => {
    emit('update:modelValue', val);
    const selectedItem = items.value.find(i => i.guid === val);
    if (selectedItem) {
        emit('itemSelected', selectedItem);
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        const response = await getStockItems();
        items.value = response.data;
    } catch (error) {
        console.error("Failed to load stock items:", error);
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