<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'organization', form: 'OrganizationReestr' })" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <p>Наименование</p>
      <InputText id="Name" v-model="OrganizationDocStore.DocData.DocMovement.Name" type="text" />
      <p>Администратор организации</p>
       <AutoComplete v-model="selectedUser" optionLabel="Name" 
        :suggestions="filteredUser" @complete="searchUser($event)" dropdown
        forceSelection @clear="clearUser()" />
      <p>Описание</p>
      <Textarea id="Description" v-model="OrganizationDocStore.DocData.DocMovement.Description" rows="5" cols="100" />
    </div>
  </div>
</template>


<script setup lang="ts">
// import { usePrimeVue } from 'primevue/config';
// import { localeRu } from '~/utils';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
const OrganizationDocStore = useDocHandlerStore('OrganizationDoc');
await OrganizationDocStore.mount({
  module: 'organization',
  form: 'OrganizationDoc',
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
const User_id = OrganizationDocStore.DocData.DocMovement.User_id;
selectedUser.value = toRaw(UserAutoCompleteStore.items).find((r: any) => r.id == User_id);


const clickSave = async () => {
  //console.log('UserAutoCompleteStore=', toRaw(UserAutoCompleteStore.model));
  const { id, Name } = toRaw(selectedUser.value) as any;
  OrganizationDocStore.DocData.DocMovement.User_id = id;
  OrganizationDocStore.DocData.DocMovement.User_Name = Name;
  OrganizationDocStore.clickSave();
}

onMounted(async () => {
  setToast(OrganizationDocStore.DocData, toast);
  setWatch(OrganizationDocStore.DocData, toast);
  // const primevue = usePrimeVue();
  // primevue.config.locale = localeRu as any;
});
</script>