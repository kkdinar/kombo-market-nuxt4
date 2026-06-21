<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'organization' })" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="_clickSave" />
          <p>|</p>
          <Button label="Создать" icon="pi pi-plus" class="p-button-success" @click="_clickNew" />
          <p>|</p>
          <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
            :disabled="!OrganizationModulesRightsStore.selectedRows || !OrganizationModulesRightsStore.selectedRows.length"
            @click="_clickEntityDelete" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <DataTable :value="FilteredRows" showGridlines v-model:selection="OrganizationModulesRightsStore.selectedRows"
      size="small" editMode="cell" @cell-edit-complete="onCellEditComplete" dataKey="id">
      <Column selectionMode="multiple" style="width: 1%" />
      <Column field="ModuleName" header="Модуль">
        <template #body="{ data }">
          {{ data.ModuleName }}
        </template>
        <template #editor="{ data, field }">
          <AutoComplete id="Module" :suggestions="ModuleAutoCompleteStore.suggestions"
            @complete="ModuleAutoCompleteStore.search" dropdown optionLabel="Name" optionValue="module"
            v-model="data[field]" fluid>
          </AutoComplete>
        </template>
      </Column>
      <Column field="Description" header="Описание" />
    </DataTable>
  </div>
</template>


<script setup lang="ts">
import { usePrimeVue } from 'primevue/config';
import { localeRu } from '~/utils';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();

const FilteredRows: any = ref([]);
// const selectedRows: any = ref([]);

const OrganizationModulesRightsStore = useDocHandlerStore('OrganizationModulesRights');
const { mount, DocData } = OrganizationModulesRightsStore;
await mount({
  module: 'organization',
  form: 'OrganizationModulesRights',
  id: 0
});

const ModuleAutoCompleteStore = autoCompleteStore('ModuleDoc');
await ModuleAutoCompleteStore.mount({});
// console.log('ModuleAutoCompleteStore=', ModuleAutoCompleteStore.suggestions);

unref(DocData.Entity).forEach((row: any) => {
  const ModuleData = ModuleAutoCompleteStore.items.find(({ module }: any) => {
    return module == row.ModuleName;
  });
  row.Description = ModuleData?.Name;
  FilteredRows.value.push(row);
});
ModuleAutoCompleteStore.setInsertedValues(FilteredRows.value, 'ModuleName', 'module');

const _clickNew = async () => {
  //Если id не из БД считаем в отрицательную сторону
  const Entity: any = toRaw(FilteredRows.value);
  console.log('!!!Entity=', Entity);

  const minID = Math.min(...Entity.map(({ id = 0 }: any) => id), 0);
  FilteredRows.value.push({
    id: minID > 0 ? -1 : minID - 1,
    form: 'OrganizationModulesRights',
    ModuleName: '',
    Description: 'Выберите модуль'
  });
}

const _clickSave = async () => {
  await OrganizationModulesRightsStore.clickSave();
  const body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'organization',
    form: 'OrganizationModulesRights',
    data: { Entity: toRaw(FilteredRows.value) }
  }
  // console.log('body=', body);

  const { Error = null, Message = null } = await post(body);
  if (Error === 'Token is expired') {
    return navigateTo('/auth');
  }
  if (Error) {
    DocData.Error = Error;
    console.log('Error=', Error);
  } else {
    DocData.Message = Message || 'Документ сохранён';
    // window.location.reload();
  }
}
const _clickEntityDelete = async () => {
  OrganizationModulesRightsStore.DocData.Entity = FilteredRows.value;
  await OrganizationModulesRightsStore.clickEntityDelete();
  FilteredRows.value = [];
  unref(DocData.Entity).forEach((row: any) => {
    const ModuleData = ModuleAutoCompleteStore.items.find(({ module }: any) => {
      return module == row.ModuleName;
    });
    row.Description = ModuleData?.Name;
    FilteredRows.value.push(row);
  });
}

const onCellEditComplete = async (event: any) => {
  const { data, newValue, field } = event;
  // console.log('{ data, newValue, field } =', { data, newValue, field });
  const { module, Name } = toRaw(newValue);
  data['ModuleName'] = module;
  data['Description'] = Name;
  ModuleAutoCompleteStore.setInsertedValues(FilteredRows.value, 'ModuleName', 'module');
}

onMounted(async () => {
  setToast(OrganizationModulesRightsStore.DocData, toast);
  setWatch(OrganizationModulesRightsStore.DocData, toast);
  // const primevue = usePrimeVue();
  // primevue.config.locale = localeRu as any;
});
</script>