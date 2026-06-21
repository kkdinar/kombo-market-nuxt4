<template>
  <div>
    <div class="fixed">
      <!-- <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack" />
          <p>|</p>
          
        </template>
</Toolbar> -->
      <Toast position="center" />
    </div>
    <br>
    <div align="center">
      <p />
      <!-- <label> <b>ФИО: </b></label>
      <InputText type="text" v-model="Name" /> -->

      <!-- <p> <b>Описание:</b></p>
      <Textarea id="Text" v-model="Description" rows="5" cols="100" />
      <br> -->
      <!--  <p>
        <label> <b>Логин: </b></label>
        <InputText type="text" v-model="Login" />
      </p>-->
      <div class="flex-auto">
        <label for="phone"><b>Номер телефона: </b> </label>
        <InputMask v-model="Telephone" date="phone" mask="+7 (999) 999-9999" placeholder="+7 (999) 999-9999" />
      </div>
      <p>
        <label> <b>Пароль: </b></label>
        <Password v-model="_Password" toggleMask :feedback="false" variant="filled" />
      </p>
      <p>
        <label> <b>Повторите пароль: </b></label>
        <Password v-model="replay_Password" toggleMask :feedback="false" variant="filled" />
      </p>
      <!--   <p>
        <label> <b>Почта: </b></label>
        <InputText type="email" v-model="Email" placeholder="your@example.com" />
      </p>-->


      <Button label="Зарегистрироваться" icon="pi pi-save" class="p-button-success" @click="clickSave" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();

// const type = route.query.type;
// if (!type) { navigateTo('/'); }

const runtimeConfig = useRuntimeConfig();
const org = runtimeConfig.public.ORG;
const businessFormName = runtimeConfig.public.businessFormName;


const Name = ref('');
const Description = ref('');
const Login = ref('');
const _Password = ref('');
const Email = ref('');
const Telephone = ref('');
const replay_Password = ref('');

localStorage.removeItem('Token');

// const clickBack = () => { navigateTo('/'); }

const clickSave = async () => {
  // if (Login.value === 'guest') {
  //   toast.add({
  //     severity: 'error', summary: "Пользователь 'guest' уже зарегистрирован", life: 3000
  //   });
  //   return;
  // }

  // if (!Login.value) {
  //   toast.add({
  //     severity: 'error', summary: "Поле 'Логин' не заполнено", life: 3000
  //   });
  //   return;
  // }

  // if (!Name.value) {
  //   toast.add({
  //     severity: 'error', summary: "Поле 'ФИО' не заполнено", life: 3000
  //   });
  //   return;
  // }
  if (!Telephone.value) {
    toast.add({
      severity: 'error', summary: "Поле 'Номер телефона' не заполнено", life: 3000
    });
    return;
  }
  if (!_Password.value) {
    toast.add({
      severity: 'error', summary: "Поле 'Пароль' не заполнено", life: 3000
    });
    return;
  }
  if (!replay_Password.value) {
    toast.add({
      severity: 'error', summary: "Поле 'Повторите пароль' не заполнено", life: 3000
    });
    return;
  }
  if (replay_Password.value !== _Password.value) {
    toast.add({
      severity: 'error', summary: "Пароли не совпали", life: 3000
    });
    return;
  }

  const regResponse = await post({
    Token: '',
    module: "dictionary",
    form: "reg",
    data: {
      DocMovement: {
        Name: Telephone.value,
        //Description: Description.value,
        Login: Telephone.value,
        Password: _Password.value,
        Email: `${Date.now()}@example.ru`,
        Telephone: Telephone.value,
        org
      }
    }
  });
  if (regResponse?.Error) {
    toast.add({
      severity: 'error', summary: regResponse.Error, life: 3000
    });
    return;
  }

  // let roleName = '';
  // if (type === 'buyer') roleName = 'komboMarketBuyerRole';
  // if (type === 'seller') roleName = 'komboMarketSellerRole';
  // if (type === 'admin') roleName = 'komboMarketAdminRole';

  if (regResponse?.Token) {
    const response = await post({
      Token: regResponse?.Token || '',
      module: "business",
      form: businessFormName,
      method: 'setKomboMarketRole',
      data: { DocMovement: { org, roleName: 'komboMarketSellerRole' } }
    });
    if (response?.Error) {
      toast.add({
        severity: 'error', summary: response.Error, life: 3000
      });
      return;
    }
    if (response?.Message) {
      toast.add({
        severity: 'info', summary: 'Регистрация прошла успешно', life: 3000
      });
    }
    localStorage.setItem('Token', regResponse.Token);
    localStorage.removeItem('isGuest');
    navigateTo('/');
    // if (type === 'seller') navigateTo('/modules/shop/ShowCatalog');
    // else navigateTo('/modules');
    return;
  }
  toast.add({
    severity: 'error', summary: 'Что-то пошло не так', life: 3000
  });
}
</script>

<!-- <style>
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
</style> -->