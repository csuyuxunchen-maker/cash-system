<template>
    <el-select :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)"
        :placeholder="placeholder" :loading="isLoading" filterable clearable class="w-100">
        <el-option v-for="account in filteredAccounts" :key="account.guid" :label="`${account.code} - ${account.name}`"
            :value="account.guid" />
    </el-select>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAccounts } from '../../services/ledgerService';

const props = defineProps({
    modelValue: String,
    accountTypes: {
        type: [String, Array],
        required: true
    },
    placeholder: {
        type: String,
        default: 'Select an account'
    },
    selectableOnly: {
        type: Boolean,
        default: true
    },
    filterByCurrencyGuid: {
        type: String,
        default: null
    },
    filterByCommodityGuid: {
        type: String,
        default: null
    }
});
const emit = defineEmits(['update:modelValue', 'accountsLoaded']);

const allAccounts = ref([]);
const isLoading = ref(false);

const filteredAccounts = computed(() => {
    const types = Array.isArray(props.accountTypes) ? props.accountTypes : [props.accountTypes];

    return allAccounts.value.filter(acc => {
        const typeMatch = types.includes(acc.account_type);
        const selectableMatch = props.selectableOnly ? !acc.placeholder : true;

        let commodityMatch = true;
        if (props.filterByCommodityGuid) {
            commodityMatch = (acc.account_type === 'STOCK' && acc.commodity_guid === props.filterByCommodityGuid);
        }

        let currencyMatch = true;
        if (props.filterByCurrencyGuid) {
            if (acc.account_type === 'STOCK') {
                if (!acc.parent_guid) {
                    currencyMatch = false;
                } else {
                    const parentAccount = allAccounts.value.find(p => p.guid === acc.parent_guid);
                    currencyMatch = parentAccount ? parentAccount.commodity_guid === props.filterByCurrencyGuid : false;
                }
            } else {
                currencyMatch = acc.commodity_guid === props.filterByCurrencyGuid;
            }
        }

        return typeMatch && selectableMatch && currencyMatch && commodityMatch;
    });
});

onMounted(async () => {
    isLoading.value = true;
    try {
        const response = await getAccounts();
        allAccounts.value = response.data;
        emit('accountsLoaded', allAccounts.value);
    } catch (error) {
        console.error("Failed to load accounts:", error);
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