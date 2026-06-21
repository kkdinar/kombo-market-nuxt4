<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'shop' })" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>

    <DataTable :value="FilteredRows" showGridlines v-model:selection="selectedRows" dataKey="id" size="small">
      <template #header>
        <div class="flex justify-content-between">
          <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
          <label>|</label>
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredRows" />
          <label>|</label>
          <Button icon="pi pi-search" @click="filterFilteredRows" aria-label="Submit" />
        </div>
      </template>
      <Column selectionMode="multiple" style="width: 1%" />
      <Column field="Name" header="Наименование" style="width: 20%" sortable>
        <template #body="{ data }">
          <Button :label="data.Name" class="p-button-link" @click="
            linkToForm({
              module: 'shop',
              form: 'ProductCardVerification',
              id: data.id,
            })
            " />
        </template>
      </Column>
      <Column field="Description" header="Описание" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
if (!localStorage.getItem('Token')) navigateTo('/auth');

import { clickBack, linkToForm } from '~/utils';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const FilteredRows: any = ref([]);
const selectedRows: any = ref([]);
const FilterText = ref('');
const ProductCardEntity: any = [];

const fillEntity = async () => {
  const { Entity = [] }: any = await post({
    module: 'shop',
    form: 'ProductCardVerification',
    method: 'getProductCardVerificationReestr',
    data: { DocMovement: {} },
    Token: localStorage.getItem('Token') || ''
  });
  ProductCardEntity.push(Entity);
  for (const { id, Material_Name, Description } of Entity) {
    FilteredRows.value.push({ id, Name: Material_Name, Description })
  }
}
fillEntity();


const clearFilters = () => {
  FilteredRows.value = ProductCardEntity;
}
const filterFilteredRows = () => {
  FilteredRows.value = [];
  ProductCardEntity.forEach((row: any) => {
    let { Name = '', Description = '' } = row;
    Name = Name || '';
    Description = Description || '';
    if ((Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    }
  });
}
</script>

<style>
@import 'primeicons/primeicons.css';

.fixed {
  position: sticky;
  /*позицианируем чтобы исчез скролл*/
  width: 100%;
  /*что бы верстка не складывалась по ширине*/
  top: 0px;
  z-index: 99999999;
  /*поверх всех элементов*/
}
</style>