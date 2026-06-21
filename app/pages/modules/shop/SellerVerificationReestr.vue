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

    <DataTable :value="FilteredRows" showGridlines dataKey="id" size="small">
      <template #header>
        <div class="flex justify-content-between">
          <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
          <label>|</label>
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredRows" />
          <label>|</label>
          <Button icon="pi pi-search" @click="filterFilteredRows" aria-label="Submit" />
        </div>
      </template>
      <Column field="Name" header="Продавец" style="width: 20%" sortable>
        <template #body="{ data }">
          <Button :label="data.Name" class="p-button-link" @click="
            linkToForm({
              module: 'shop',
              form: 'SellerVerification',
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

const FilteredRows = ref([{}]);
const FilterText = ref('');

 const { Entity = [] } = await post({
    module: 'shop',
    form: 'SellerVerificationReestr',
    method: 'getSellerVerificationReestr',
    data: { DocMovement: {} },
    Token: localStorage.getItem('Token') || ''
  });
let dataArr = Entity;
console.log('dataArr=', dataArr);

dataArr.forEach((row: any) => {
//   const foundStatus = statusArr.find((r: any) => r.Status === row.Status) || {};
//   row.Status = foundStatus.Name;
//   row.Name = row.Material_Name;
});

FilteredRows.value = dataArr;

const clearFilters = () => {
  FilteredRows.value = dataArr;
}
const filterFilteredRows = () => {
  FilteredRows.value = [];
  dataArr.forEach((row: any) => {
    let { Name = '', Description = '' } = row;
    Description = Description || '';
    if ((Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } 
  });
}

onMounted(async () => {
//   setToast(DocData, toast);
});
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