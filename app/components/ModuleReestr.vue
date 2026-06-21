<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />

    <DataTable :value="FilteredRows" showGridlines dataKey="id" size="small">
      <template #header>
        <div class="flex justify-content-between">
          <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
          <label>|</label>
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="runFilter" />
          <label>|</label>
          <Button icon="pi pi-search" @click="runFilter" aria-label="Submit" />
        </div>
      </template>
      <Column field="ModuleName" header="Модуль" style="width: 10%" sortable />
      <Column header="Документ" style="width: 90%" sortable>
        <template #body="{ data }">
          <Button :label="data.FormName" class="p-button-link" @click="
            linkToForm({
              module: data.module,
              form: data.form,
              id: data.id,
            })
            " />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
if (!localStorage.getItem('Token')) navigateTo('/auth');
const props = defineProps({
  moduleName: {
    type: String,
    required: true
  }
});
import { linkToForm } from '~/utils';
const FilteredRows = ref([{}]);
const FilterText = ref('');
const filterColumnName: string[] = ['ModuleName', 'FormName'];

const menu = await updateMenuItems(props.moduleName);
FilteredRows.value = unref(menu);

const clearFilters = () => {
  FilteredRows.value = unref(menu);
}
const runFilter = () => {
  FilteredRows.value = filterTableRows(menu, FilterText.value, filterColumnName);
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