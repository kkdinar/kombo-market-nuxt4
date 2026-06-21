<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'config' })" />
          <p>|</p>
          <Button label="Создать" icon="pi pi-plus" class="p-button-success" @click="clickNewConfig" />
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
              module: 'config',
              form: 'ConfigurationDoc',
              id: data.id,
            })
            " />
        </template>
      </Column>
      <Column field="Description" header="Описание" />
    </DataTable>

    <Dialog v-model:visible="visible" modal header="Создание новой настройки" :style="{ width: '50%' }">
      <div align="center">
        <label> <b>Наименование настройки: </b></label>
        <InputText v-model="newConfigName" :style="{ width: '100%' }" />
        <p />
        <label> <b>Тип группы: </b></label>
        <AutoComplete v-model="selectedConfig" optionLabel="Name" :suggestions="filteredConfig"
          @complete="searchConfig($event)" dropdown forceSelection @clear="clearConfig()" />
        <p />
      </div>
      <p />
      <div align="right">
        <Button type="button" label="Отмена" class="p-button-danger" severity="secondary"
          @click="visible = false"></Button>
        <label>|</label>
        <Button type="button" label="Создать" @click="createConfig"></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { clickNew, clickDelete, clickBack, linkToForm } from '~/utils';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores'
const toast = useToast();

const visible = ref(false);
const newConfigName = ref('');
const configurationType = [
  { Type: 'resend_file', Name: 'Переотправка файлов' }
];
const selectedConfig: any = ref();
const filteredConfig: any = ref();
const searchConfig = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredConfig.value = [...configurationType];
    } else {
      filteredConfig.value = configurationType.filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const clearConfig = () => {
  selectedConfig.value = null;
}
const clickNewConfig = async () => {
  visible.value = true;
}


const FilteredRows = ref([{}]);
const selectedRows: any = ref([]);
const FilterText = ref('');

const DataStore = useDocHandlerStore('ConfigurationDoc');
const { mount, DocData } = DataStore;
await mount({
  module: 'config',
  form: 'ConfigurationDoc',
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
  const { Error = null, Message = null } = await clickDelete({ module: 'config', form: 'ConfigurationDoc', selectedRows: unref(selectedRows) });
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

const createConfig = async () => {
  if (!newConfigName.value) {
    toast.add({ severity: 'error', summary: 'Заполните "Наименование настройки"', life: 3000 });
    return;
  }
  visible.value = false;
  const Token = localStorage.getItem('Token') || '';
  let body: any = {
    module: 'config',
    form: 'ConfigurationDoc',
    Token,
    data: {
      DocMovement: {
        Name: newConfigName.value,
        Type: selectedConfig.value.Type
      }
    }
  }
  const { DocMovement = { id: null } as any, Error = 'Нет данных' } = await post(body);
  console.log('!!!DocMovement=', DocMovement);

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