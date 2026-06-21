<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'dictionary', form: 'UserReestr' })" />
          <p>|</p>
          <!-- <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="UserDocStore.clickSave" /> -->
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="_clickSave" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>
    <br>
    <div align="center">
      <label> <b>ФИО: </b></label>
      <InputText type="text" v-model="UserDocStore.DocData.DocMovement.Name" />

      <p> <b>Описание:</b></p>
      <Textarea id="Text" v-model="UserDocStore.DocData.DocMovement.Description" rows="5" cols="100" />
      <br>
      <!-- <p>
        <label> <b>Организация пользователя: </b></label>
        <AutoCompleteComponent :obj="Contractor" v-model="autoCompleteSelectedObj" />
      </p>  -->
      <!-- <p>
        <label> <b>Должность: </b></label>
        <AutoCompleteComponent :obj="StaffJob" v-model="autoCompleteSelectedObj" />
      </p>  -->
      <p>
        <label> <b>Логин: </b></label>
        <InputText type="text" v-model="UserDocStore.DocData.DocMovement.Login" />
      </p>
      <p>
        <label> <b>Пароль: </b></label>
        <Password v-model="UserDocStore.DocData.DocMovement.Password" toggleMask :feedback="false" variant="filled" />
      </p>
      <p>
        <label> <b>Почта: </b></label>
        <InputText type="email" v-model="UserDocStore.DocData.DocMovement.Email" placeholder="your@example.com" />
      </p>
      <!--<label> <b>Номер телефона: </b></label>
        <InputText type="text" v-model="UserDocStore.DocData.DocMovement.Telephone" />
        -->
      <div class="flex-auto">
        <label for="phone">Номер телефона: </label>
        <InputMask v-model="UserDocStore.DocData.DocMovement.Telephone" date="phone" mask="+7 (999) 999-9999"
          placeholder="+7 (999) 999-9999" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();

const UserDocStore = useDocHandlerStore('UserDoc');
await UserDocStore.mount({
  module: 'dictionary',
  form: 'UserDoc',
  id: route.query.id as string
});



// const autoCompleteSelectedObj = ref();
// const Contractor = { Entity: [{}], selectedObj: {}, filteredObj: [] };
// const ContractorDocStore = useDocHandlerStore('ContractorDoc');
// await ContractorDocStore.mount({
//   module: 'dictionary',
//   form: 'ContractorDoc',
//   id: 0
// });
// Contractor.Entity = toRaw(ContractorDocStore.DocData.Entity);
// const userId = UserDocStore.DocData.DocMovement.User_id;
// Contractor.selectedObj = Contractor.Entity.find((r: any) => r.id == userId) || {};

const _clickSave = async () => {
  // UserDocStore.DocData.DocMovement.User_id = unref(autoCompleteSelectedObj)?.id ?? null;
  // UserDocStore.DocData.DocMovement.User_Name = unref(autoCompleteSelectedObj)?.Name ?? null;
  // if(!UserDocStore.DocData.DocMovement.Login){
  //     toast.add({
  //     severity: 'error', summary: "Поле Логин не заполнено", life: 3000
  //   });
  //   return;
  // }
  // if(!UserDocStore.DocData.DocMovement.Password){
  //     toast.add({
  //     severity: 'error', summary: "Поле Пароль не заполнено", life: 3000
  //   });
  //   return;
  // }

  const response = await post({
    Token: localStorage.getItem('Token') || '',
    module: "dictionary",
    form: "UserDoc",
    method: "checkUserData",
    data: UserDocStore.DocData
  });
  if (response?.Error) {
    toast.add({
      severity: 'error', summary: response.Error, life: 3000
    });
    return;
  }
  // if (response?.Message) {
  //   toast.add({
  //     severity: 'info', summary: 'Документ сохранен.', life: 3000
  //   });
  // }
  UserDocStore.clickSave();
}

onMounted(async () => {
  setToast(UserDocStore.DocData, toast);
  setWatch(UserDocStore.DocData, toast);
  // const primevue = usePrimeVue();
  // primevue.config.locale = localeRu as any;
});
</script>

<style>
.fixed {
  position: sticky;
  /*позицианируем чтобы исчез скролл*/
  width: 100%;
  /*что бы верстка не складывалась по ширине*/
  top: 0px;
  z-index: 99999999;

  /*поверх всех элементов*/
  .error {
    border-color: red;
  }

  .error-msg {
    color: red;
    font-size: 0.8em;
  }
}
</style>