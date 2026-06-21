<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: props.module })" />
          <p>|</p>
          <Button label="Создать" icon="pi pi-plus" class="p-button-success"
            @click="clickNew({ module: props.module, form: props.form })" />
          <p>|</p>
          <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
            :disabled="!selectedRows || !selectedRows.length" @click="_clickDelete" />
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
              module: props.module,
              form: props.form,
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
const props = defineProps({
  module: {
    type: String,
    required: true
  },
  form: {
    type: String,
    required: true
  }
});
import { clickNew, clickDelete, clickBack, linkToForm } from '~/utils';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores'
const toast = useToast();

const FilteredRows = ref([{}]);
const selectedRows: any = ref([]);
const FilterText = ref('');

const DataStore = useDocHandlerStore(props.form);
const { mount, DocData } = DataStore;
await mount({
  module: props.module,
  form: props.form,
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
  const { Error = null, Message = null } = await clickDelete({ module: props.module, form: props.form, selectedRows: unref(selectedRows) });
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

<style>
/* @import 'primevue/resources/themes/aura-light-green/theme.css'; */
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