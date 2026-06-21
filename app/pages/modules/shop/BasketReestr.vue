<template>
  <div>
    <Toast />
    <Toolbar>
      <template #start>
        <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'shop' })" />
      </template>
    </Toolbar>
    <DataTable :value="Filtered" showGridlines dataKey="id" size="small">
      <template #header>
        <div class="flex justify-content-between">
          <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFiltered" />
          <Button icon="pi pi-search" @click="filterFiltered" aria-label="Submit" />
        </div>
      </template>
      <Column field="id" header="Код" style="width: 1%" />
      <Column field="Nomer" header="Номер" style="width: 10%" />
      <Column field="Price" header="Стоимость" style="width: 10%" />
      <Column field="OrderStatus_Name" header="Статус" style="width: 79%" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { clickBack } from '~/utils/func.js';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { useDocHandlerStore } from '~/stores'

const Filtered = ref([{}]);
const FilterText = ref('');

const BasketDocStore = useDocHandlerStore('BasketDoc');
const { mount, DocData } = BasketDocStore;
await mount({
  module: 'shop',
  form: 'BasketDoc',
  id: 0
});
Filtered.value = DocData.Entity;

const clearFilters = () => {
  Filtered.value = unref(DocData.Entity);
}

const filterFiltered = () => {
  Filtered.value = [];
  unref(DocData.Entity).forEach((row: any) => {
    let { Name = '', Description = '' } = row;
    Name = Name || '';
    Description = Description || '';
    if ((Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      Filtered.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      Filtered.value.push(row);
    }
  });
}

onMounted(async () => {
  setToast(DocData, toast);
});
</script>

<style>
@import 'primeicons/primeicons.css';
</style>