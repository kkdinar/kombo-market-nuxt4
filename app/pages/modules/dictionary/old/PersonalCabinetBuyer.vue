<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'shop', form: 'ShowCatalog' })" />
          <p>|</p>
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
        <label for="phone"><b>Номер телефона:</b> </label>
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
        <label> <b>Макс: </b></label>
        <label>|</label>
        <Button label="Верифицировать" icon="pi pi-save" class="p-button-success" @click="clickVerify" />
        <label>|</label>
        <InputText type="text" v-model="UserDocStore.DocData.DocMovement.Max" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
import { ref } from 'vue';

const UserDocStore = useDocHandlerStore('UserDoc');
await UserDocStore.mount({
  module: 'dictionary',
  form: 'PersonalCabinetBuyer',
  id: 1
});

const _clickSave = async () => {
  const response = await post({
    Token: localStorage.getItem('Token') || '',
    module: "dictionary",
    form: "PersonalCabinetBuyer",
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

const clickVerify = async () => {
  window.location.href = 'https://max.ru/id027313305447_bot';
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