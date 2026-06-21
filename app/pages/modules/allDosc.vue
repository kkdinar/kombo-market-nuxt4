<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="_clickBack" />
        </template>
        <template #end>
          <!-- <Button label="Настройки" icon="pi pi-cog" @click="mainWindowFormList" /> -->
          <label>|</label>
          <Button label="Выход" icon="pi pi-sign-out" @click="_exit" />
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
      <Column field="ModuleName" header="Модуль" style="width: 11%" sortable />
      <Column header="Документ" style="width: 89%" sortable>
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

const FilteredRows = ref([{}]);
const FilterText = ref('');
const filterColumnName: string[] = ['ModuleName', 'FormName'];

const menu = await updateMenuItems();
FilteredRows.value = unref(menu);
//console.log('FilteredRows', FilteredRows);

const clearFilters = () => {
  FilteredRows.value = unref(menu);
}
const runFilter = () => {
  FilteredRows.value = filterTableRows(menu, FilterText.value, filterColumnName);
}
const _clickBack = () => {
  navigateTo('/');
}
const mainWindowFormList = () => {
  navigateTo('/modules/sitesetting/MainWindowFormList');
}
const _exit = () => {
  localStorage.clear();
  navigateTo('/');
}

</script>

<style>
@import 'primeicons/primeicons.css';
</style>
