<template>
  <div align="center">
    <Toast />
    <p>Логин</p>
    <InputText type="text" v-model="Login" />
    <p>Пароль</p>
    <Password v-model="_Password" toggleMask :feedback="false" variant="filled" />
    <p />
    <Button label="Вход" @click="enterForm()" />
    <label>|</label>
    <Button label="Регистрация" @click="reg" />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const route = useRoute();

// const type = route.query.type;
// if (!type) { navigateTo('/'); }

// const reg = async () => { navigateTo('/reg?type=' + route.query.type); }
const reg = async () => { navigateTo('/reg'); }

const Login = ref();
const _Password = ref();

const enterForm = async () => {
  let body: MessageBody = {
    module: 'session',
    form: 'auth',
    data: { DocMovement: { Login: Login.value, Password: _Password.value } }
  }
  let response: ApiResponse = await post(body);
  // if (response.Error === 'Token is expired') { navigateTo('/auth'); return; }
  setToast(response, toast);
  const Token = response.Token;
  if (Token) {
    const org = runtimeConfig.public.ORG || null;
    localStorage.setItem('Token', Token);
    localStorage.removeItem('isGuest');
    // localStorage.setItem('isGuest', 'false');
    body = {
      module: 'session',
      form: 'setOrg',
      Token,
      data: { DocMovement: { org } }
    };
    response = await post(body);
    if (response.Error) {
      console.log('Error=', response.Error);
      toast.add({ severity: 'error', summary: response.Error, life: 3000 });
    } else {
      // if (type === 'seller') navigateTo('/modules/shop/ShowCatalog');
      // else navigateTo('/modules');
      navigateTo('/');
    }
  }
}
</script>

<style>
@import 'primeicons/primeicons.css';
</style>
