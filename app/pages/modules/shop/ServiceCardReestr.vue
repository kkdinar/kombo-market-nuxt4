<template>
  <div class="products-page">
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="main" />
          <p>|</p>
          <Button label="Создать" icon="pi pi-plus" class="p-button-success"
            @click="clickNew({ module: 'shop', form: 'ServiceCardDoc' })" />
          <p>|</p>
          <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
            :disabled="!selectedRows || !selectedRows.length" @click="_clickDelete" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>
    <DataTable :value="FilteredRows" showGridlines v-model:selection="selectedRows" dataKey="id" size="small">
      <template #header>
        <table class="table">
          <tr>
            <td colspan="3">
              <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredRows" fluid />
            </td>
            <td>
              <Button icon="pi pi-search" @click="filterFilteredRows" aria-label="Submit" label="Найти" />
              |
              <Button icon="pi pi-filter-slash" label="Очистить фильтр" class="p-button-outlined"
                @click="clearFilters" />
            </td>
            <td></td>
          </tr>
        </table>
        <!-- <div class="flex justify-content-between">
          <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
          <label>|</label>
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredRows" />
          <label>|</label>
          <Button icon="pi pi-search" @click="filterFilteredRows" aria-label="Submit" />
        </div> -->
      </template>
      <Column selectionMode="multiple" style="width: 1%" />
      <Column field="Status" header="Статус" style="width: 5%" sortable />
      <Column field="Name" header="Наименование" style="width: 20%" sortable>
        <template #body="{ data }">
          <Button :label="data.Name" class="p-button-link" @click="
            linkToForm({
              module: 'shop',
              form: 'ServiceCardDoc',
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
import { clickNew, clickDelete, clickBack, linkToForm } from '~/utils';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores'
const toast = useToast();

const FilteredRows = ref([{}]);
const selectedRows: any = ref([]);
const FilterText = ref('');

const DataStore = useDocHandlerStore('ServiceCardDoc');
const { mount, DocData } = DataStore;
await mount({
  module: 'shop',
  form: 'ServiceCardDoc',
  id: 0
});
let dataArr = toRaw(DocData.Entity);
const statusArr: any = [
  { Name: 'Черновик', Status: 'draft' },
  { Name: 'Требуется проверка', Status: 'needCheck' },
  { Name: 'Проверено', Status: 'verified' }];
console.log('dataArr=', dataArr);

dataArr.forEach((row: any) => {
  const foundStatus = statusArr.find((r: any) => r.Status === row.Status) || {};
  row.Status = foundStatus.Name;
  row.Name = row.Service_Name;
});

FilteredRows.value = dataArr;

const clearFilters = () => {
  FilteredRows.value = dataArr;
}
const filterFilteredRows = () => {
  FilteredRows.value = [];
  dataArr.forEach((row: any) => {
    let { Name = '', Description = '', Status = '' } = row;
    Description = Description || '';
    Status = Status || '';
    if ((Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } else if ((Status.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    }
  });
}

const _clickDelete = async () => {
  const { Error = null, Message = null } = await clickDelete({ module: 'shop', form: 'ServiceCardDoc', selectedRows: unref(selectedRows) });
  if (Error) {
    setToast({ Error }, toast);
  } else {
    const _selectedRows = selectedRows.value || [];
    const newTable: any = dataArr;
    dataArr = [];
    newTable.forEach((row: any) => {
      if (!_selectedRows.some((r: any) => row.id === r.id)) {
        dataArr.push(row);
      }
    });
    FilteredRows.value = dataArr;
  }
}

const main = async () => { navigateTo('/'); }

onMounted(async () => {
  setToast(DocData, toast);
});
</script>

