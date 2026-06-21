<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button icon="pi pi-chevron-left" @click="clickBack({ module: 'message' })" />
          <p>|</p>
          <Button icon="pi pi-plus" class="p-button-success" @click="clickNewMessengerGroup" />
          <p>|</p>
          <Button icon="pi pi-trash" class="p-button-danger"
            :disabled="!selectedRows || !selectedRows.length" @click="_clickDelete" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>

    <DataTable :value="FilteredRows" showGridlines v-model:selection="selectedRows" dataKey="id" size="small">
      <template #header>
        <div class="flex justify-content-between">
          <Button icon="pi pi-filter-slash" class="p-button-outlined" @click="clearFilters" />
          <label>|</label>
          <InputText v-model="FilterText" placeholder="" @keydown.enter="filterFilteredRows" tyle="width: 10%"/>
          <label>|</label>
          <Button icon="pi pi-search" @click="filterFilteredRows" aria-label="Submit" />
        </div>
      </template>
      <Column selectionMode="multiple" style="width: 1%" />
      <Column field="Name" header="Наименование" sortable style="width: 20%">
        <template #body="{ data }">
          <Button :label="data.Name" class="p-button-link" @click="
            linkToForm({
              module: 'message',
              form: 'MessengerDoc',
              id: data.id,
            })
            " />
        </template>
      </Column>
      <Column field="UnreadMessages" header="Непрочитанные сообщения" sortable style="width: 20%" />
      <Column field="SendingMethodName" header="Тип группы" sortable />
    </DataTable>

    <Dialog v-model:visible="visible" modal header="Создание новой группы" :style="{ width: '50%' }">
      <div align="center">
        <label> <b>Наименование группы: </b></label>
        <InputText v-model="newGroupName" :style="{ width: '100%' }" />
        <p />
        <label> <b>Тип группы: </b></label>
        <AutoComplete v-model="selectedMessenger" optionLabel="Name" :suggestions="filteredMessenger"
          @complete="searchMessenger($event)" dropdown forceSelection @clear="clearMessenger()" />
        <p />
        <div v-if="selectedMessenger.SendingMethod !== 'amessenger'">
          <label> <b>Код/id группы: </b></label>
          <InputText v-model="newGroupId" :style="{ width: '100%' }" />
        </div>
        <p />
        <label> <b>Пользователи группы: </b></label>
        <div>
          {{ userList }} </div>
        <p />
      </div>

      <DataTable :value="UserDocStore.DocData.Entity" showGridlines v-model:selection="UserDocStore.selectedRows"
        dataKey="id" editMode="cell" size="small" @rowSelect="onRowSelectUnselect" @rowUnselect="onRowSelectUnselect">
        <Column selectionMode="multiple" style="width: 1%" />
        <Column field="Name" style="width: 99%" />
      </DataTable>
      <p />
      <div align="right">
        <Button type="button" label="Отмена" class="p-button-danger" severity="secondary"
          @click="visible = false"></Button>
        <label>|</label>
        <Button type="button" label="Создать" @click="createMessageGroup"></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// import { clickNew, clickDelete, clickBack, linkToForm } from '~/utils';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const FilteredRows: any = ref([]);
const selectedRows: any = ref([]);
const FilterText = ref('');
const visible = ref(false);
const userList = ref('');
const newGroupName = ref('');
const newGroupId = ref('');

const DataStore = useDocHandlerStore('MessengerReestr');
const { mount, DocData } = DataStore;
await mount({
  module: 'message',
  form: 'MessengerReestr',
  id: 0
});

const messengerType = [
  { SendingMethod: 'amessenger', Name: 'Ассистент Мессенджер' },
  { SendingMethod: 'telegram', Name: 'Телеграмм' },
  { SendingMethod: 'max', Name: 'МАХ' },
  { SendingMethod: 'mail', Name: 'Электронная почта' },
  { SendingMethod: 'kontur', Name: 'Контур Диадок' },
  { SendingMethod: 'sbis', Name: 'СБИС' }
];

const entityArr = toRaw(DocData.Entity).map((row: any) => {
  const MessengerTypeRow = messengerType.find((r: any) => r?.SendingMethod == row?.SendingMethod);
  row.SendingMethodName = MessengerTypeRow?.Name;
  return row;
}) || [];
FilteredRows.value = entityArr;

const UserDocStore = useDocHandlerStore('UserDoc');

const clickNewMessengerGroup = async () => {
  await UserDocStore.mount({
    module: 'dictionary',
    form: 'UserDoc',
    id: 0
  });
  UserDocStore.selectedRows = [];
  visible.value = true;
}

const onRowSelectUnselect = () => {
  userList.value = UserDocStore.selectedRows.map(({ Name }: any) => Name).join(',');
}

const filterFilteredRows = () => {
  FilteredRows.value = [];
  unref(DocData.Entity).forEach((row: any) => {
    let { Name = '', Description = '', SendingMethodName = '' } = row;
    Name = Name || '';
    Description = Description || '';
    if ((Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } else if ((SendingMethodName.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    }
  });
}
const clearFilters = () => {
  FilteredRows.value = unref(DocData.Entity);
  FilterText.value = '';
}
const _clickDelete = async () => {
  const { Error = null, Message = null } = await clickDelete({ module: 'message', form: 'MessengerReestr', selectedRows: unref(selectedRows) });
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


const selectedMessenger: any = ref({ SendingMethod: 'amessenger', Name: 'Ассистент Мессенджер' });
const filteredMessenger: any = ref();
const searchMessenger = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredMessenger.value = [...messengerType];
    } else {
      filteredMessenger.value = messengerType.filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const clearMessenger = () => {
  selectedMessenger.value = null;
}

const createMessageGroup = async () => {
  if (!newGroupName.value) {
    toast.add({ severity: 'error', summary: 'Заполните "Наименование группы"', life: 3000 });
    return;
  }
  if (selectedMessenger.value.SendingMethod !== 'amessenger' && !newGroupId.value) {
    toast.add({ severity: 'error', summary: 'Заполните "Код/id группы"', life: 3000 });
    return;
  }
  visible.value = false;
  const Token = localStorage.getItem('Token') || '';
  let body: any = {
    module: 'message',
    form: 'MessengerReestr',
    Token,
    data: {
      DocMovement: {
        Name: newGroupName.value,
        Group_id: newGroupId.value,
        SendingMethod: selectedMessenger.value.SendingMethod || 'amessenger'
      }
    }
  }
  const { DocMovement = { id: null } as any, Error = 'Нет данных' } = await post(body);
  if (DocMovement && DocMovement.id) {
    const id = DocMovement.id;
    const Entity: any = [];
    UserDocStore.selectedRows.forEach((row: any) => {
      Entity.push({
        Parent: id,
        User_id: row.id,
        User_Name: row.Name
      })
    });
    body = {
      module: 'message',
      form: 'MessengerUser',
      Token,
      data: { Entity }
    }
    const Appendix = await post(body);
    if (Appendix.Error) {
      console.log(Error);
    } else {
      window.location.reload();
    }
  } else {
    console.log(Error);
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