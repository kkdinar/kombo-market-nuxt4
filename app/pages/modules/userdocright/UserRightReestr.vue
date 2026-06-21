<template>
  <div class="products-page">
    <div class="fixed">
      <Toast position="center" />
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'userdocright' })" />
          <p>|</p>
          <Button label="Создать" icon="pi pi-plus" class="p-button-success"
            @click="clickNew({ module: 'userdocright', form: 'UserRight' })" />
          <p>|</p>
          <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
                        :disabled="!selectedRows || !selectedRows.length" @click="_clickDelete" />
        </template>
      </Toolbar>
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
      <Column field="User_Name" header="Наименование" sortable style="width: 20%">
        <template #body="{ data }">
          <Button :label="data.User_Name" class="p-button-link" @click="
            linkToForm({
              module: 'userdocright',
              form: 'UserRight',
              id: data.id,
            })
            " />
        </template>
      </Column>
      <Column field="id" header="id" sortable >
        <template #body="{ data }">
          <Button :label="data.id" class="p-button-link" @click="
            linkToForm({
              module: 'userdocright',
              form: 'UserRight',
              id: data.id,
            })
            " />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const FilteredRows = ref([{}]);
const selectedRows: any = ref([]);
const FilterText = ref('');

const DataStore = useDocHandlerStore('UserRight');
const { mount, DocData } = DataStore;
await mount({
  module: 'userdocright',
  form: 'UserRight',
  id: 0
});
FilteredRows.value = unref(DocData.Entity);

const clearFilters = () => {
  FilteredRows.value = unref(DocData.Entity);
}
const filterFilteredRows = () => {
  FilteredRows.value = [];
  unref(DocData.Entity).forEach((row: any) => {
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

const _clickDelete = async () => {
  const { Error = null, Message = null } = await clickDelete({ module: 'userdocright', form: 'UserRight', selectedRows: unref(selectedRows) });
  if (Error) {
    setToast({ Error }, toast);
  } else if (Message) {
    setToast({ Message }, toast);

    const _selectedRows = selectedRows.value || [];
    const newTable: any = toRaw(DocData.Entity);
    DocData.Entity = [];
    newTable.forEach((row: any) => {
      if (!_selectedRows.some((r: any) => row.id === r.id)) {
        DocData.Entity.push(row);
      }
    });
    FilteredRows.value = toRaw(DocData.Entity);
  }
}

onMounted(async () => {
  setToast(DocData, toast);
});

</script>