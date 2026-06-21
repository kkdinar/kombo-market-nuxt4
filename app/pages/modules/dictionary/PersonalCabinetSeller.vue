<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="main" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="_clickSave" />
          <p>|</p>
          <Button label="Настройки" icon="pi pi-cog" @click="clickBack({ module: 'shop', form: 'SettingDoc' })" />
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
      <p>
      <div class="flex-auto">
        <label for="phone">Номер телефона: </label>
        <InputMask v-model="UserDocStore.DocData.DocMovement.Telephone" date="phone" mask="+7 (999) 999-9999"
          placeholder="+7 (999) 999-9999" />
      </div>
      </p>
      <p>
        <label><b>Сайт: </b></label>
        <InputText type="url" v-model="UserDocStore.DocData.DocMovement.Url" placeholder="https://example.com"
          @blur="validateUrl" :class="{ 'p-invalid': isInvalid }" />
        <small v-if="isInvalid" class="p-error">Введен некорректный URL</small>
      </p>
      <p>
        <label><b>ИНН: </b></label>
        <InputText v-model="UserDocStore.DocData.DocMovement.INN" placeholder="ИНН (10 или 12 цифр)" @blur="validateINN"
          :class="{ 'p-invalid': isInvalid }" />
        <label>|</label>
        <small v-if="isInvalid" class="p-error">Введен некорректный ИНН</small>
        <Button label="Заполнить" icon="pi pi-save" class="p-button-success" @click="searchINN"
          :disabled="isInvalid || !UserDocStore.DocData.DocMovement.INN" />
      </p>
      <p>
        <label><b>ЕГРЮЛ: </b></label>
        <InputText type="url" v-model="UserDocStore.DocData.DocMovement.USR"
          placeholder="ОГРН (13 цифр) или ОГРНИП (15 цифр)" @blur="validateUSR" :class="{ 'p-invalid': isInvalid }" />
        <small v-if="isInvalid" class="p-error">Введен некорректный ЕГРЮЛ</small>
      </p>
      <p>
        <label> <b>Юридический адрес: </b></label>
        <InputText type="text" v-model="UserDocStore.DocData.DocMovement.LegalAddress" />
      </p>
      <p>
        <label> <b>Фактический адрес: </b></label>
        <InputText type="text" v-model="UserDocStore.DocData.DocMovement.Address" />
      </p>
      <p>
        <label> <b>Макс: </b></label>
        <InputText type="text" v-model="UserDocStore.DocData.DocMovement.Max" />
      </p>
      <!-- <br>
      <Button label="Правоустанавливающие документы для товаров" icon="pi pi-eye" @click="clickProductDoc" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
import { ref } from 'vue';
const runtimeConfig = useRuntimeConfig();
const dadataToken = runtimeConfig.public.dadataToken || null;

const response: any = await post({
  Token: localStorage.getItem('Token') || '',
  module: 'session',
  form: 'getUserId',
  method: 'getUserId'
});
const { User_id } = response.DocMovement;

const UserDocStore = useDocHandlerStore('UserDoc');
await UserDocStore.mount({
  module: 'dictionary',
  form: 'PersonalCabinetSeller',
  id: User_id
});

const _clickSave = async () => {
  const response = await post({
    Token: localStorage.getItem('Token') || '',
    module: "dictionary",
    form: "PersonalCabinetSeller",
    method: "checkUserData",
    data: UserDocStore.DocData
  });
  if (response?.Error) {
    toast.add({
      severity: 'error', summary: response.Error, life: 3000
    });
    return;
  }
  UserDocStore.clickSave();
}

const isInvalid = ref(false);

const validateUrl = () => {
  const url = UserDocStore.DocData.DocMovement.Url;
  if (!url) {
    isInvalid.value = false;
    return;
  }
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/.*)?$/;
  isInvalid.value = !urlPattern.test(url);
};

let dadataINN: any;
const validateINN = () => {
  dadataINN = UserDocStore.DocData.DocMovement.INN;
  const INN = UserDocStore.DocData.DocMovement.INN;
  if (!INN) {
    isInvalid.value = false;
    return;
  }
  const INNPattern = /^\d{10}|\d{12}$/;
  isInvalid.value = !INNPattern.test(INN);
};

const validateUSR = () => {
  const USR = UserDocStore.DocData.DocMovement.USR;
  if (!USR) {
    isInvalid.value = false;
    return;
  }
  const USRPattern = /^(\d{13}|\d{15})$/;
  isInvalid.value = !USRPattern.test(USR);
};

// const clickProductDoc = () => {
//   const url = '/modules/jurist/SaleDocsDoc?id=' + route.query.id;
//   return navigateTo(url);
// }

const searchINN = async () => {
  validateINN();
  const query = UserDocStore.DocData.DocMovement.INN;
  console.log('query = ', query);

  const token = dadataToken;
  const answer = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
    method: 'POST',
    headers: {
      'Authorization': "Token " + token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      query // ИНН
    })
  });
  answer.json().then(data => {
    // Здесь данные уже распарсены
    console.log('Полученные данные:', data);
    // Извлекаем нужные поля
    UserDocStore.DocData.DocMovement.USR = data.suggestions[0].data.ogrn;
    UserDocStore.DocData.DocMovement.LegalAddress = data.suggestions[0].data.address.value;
    UserDocStore.DocData.DocMovement.Address = data.suggestions[0].data.address.value;
    UserDocStore.DocData.DocMovement.Name = data.suggestions[0].data.management.name;
    UserDocStore.DocData.DocMovement.Description = data.suggestions[0].data.name.full;

  })
}

const main = async () => { navigateTo('/'); }

onMounted(async () => {
  setToast(UserDocStore.DocData, toast);
  setWatch(UserDocStore.DocData, toast);
});
</script>

<style>
@import 'primeicons/primeicons.css';

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