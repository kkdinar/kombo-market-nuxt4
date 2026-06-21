<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'telegram', form: 'TgUserReestr' })" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <p>Выберите пользователя, которому хотите присвоить ChatId:</p>
       <AutoComplete v-model="selectedUser" optionLabel="Name" 
        :suggestions="filteredUser" @complete="searchUser($event)" dropdown
        forceSelection @clear="clearUser()" />
      <p>ChatId:</p>
      <InputText id="ChatId" v-model="UserDocStore.DocData.DocMovement.Telegram" type="text" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
const UserDocStore = useDocHandlerStore('TgUserDoc');
await UserDocStore.mount({
  module: 'telegram',
  form: 'TgUserDoc',
  id: route.query.id as string
});

const UserAutoCompleteStore = autoCompleteStore('UserDoc');
await UserAutoCompleteStore.mount({
  module: 'dictionary',
  form: 'UserDoc'
});

const filteredUser = ref();
const selectedUser = ref();
const searchUser = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredUser.value = [...toRaw(UserAutoCompleteStore.items)];
    } else {
      filteredUser.value = toRaw(UserAutoCompleteStore.items).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const clearUser = () => {
  selectedUser.value = null;
}
const User_id = UserDocStore.DocData.DocMovement.User_id;
selectedUser.value = toRaw(UserAutoCompleteStore.items).find((r: any) => r.id == User_id);


const clickSave = async () => {
  //console.log('UserAutoCompleteStore=', toRaw(UserAutoCompleteStore.model));
  const { id, Name } = toRaw(selectedUser.value) as any;
  UserDocStore.DocData.DocMovement.User_id = id;
  UserDocStore.DocData.DocMovement.User_Name = Name;
  console.log('UserDocStore = ', toRaw(UserDocStore.DocData.DocMovement));
  UserDocStore.clickSave();
}

onMounted(async () => {
  setToast(UserDocStore.DocData, toast);
  setWatch(UserDocStore.DocData, toast);
});
</script>