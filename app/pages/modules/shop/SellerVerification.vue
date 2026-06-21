<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'shop', form: 'SellerVerificationReestr' })" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>
    <br>
    <div align="center">
      <label> <b>ФИО: </b> {{ DocMovement.Name }}</label>
      <p> <b>Описание:</b> {{ DocMovement.Description }}</p>
      <p> <label> <b>Логин: </b>{{ DocMovement.Login }}</label> </p>
      <p> <label> <b>Почта: </b>{{ DocMovement.Email }}</label> </p>
      <p> <label> <b>Номер телефона: </b>{{ DocMovement.Telephone }}</label> </p>
      <p> <label> <b>Сайт: </b>{{ DocMovement.Url }}</label> </p>
      <p> <label> <b>ИНН: </b>{{ DocMovement.INN }}</label> </p>
      <p> <label> <b>ЕГРЮЛ: </b>{{ DocMovement.USR }}</label> </p>
      <p> <label> <b>Юридический адрес: </b>{{ DocMovement.LegalAddress }}</label> </p>
      <p> <label> <b>Фактический адрес: </b>{{ DocMovement.Address }}</label> </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
import { ref } from 'vue';

const DocMovement: any = ref()

const response = await post({
  module: 'shop',
  form: 'SellerVerification',
  method: 'getSellerVerification',
  data: { DocMovement: { id: route.query.id as string } },
  Token: localStorage.getItem('Token') || ''
});
DocMovement.value = response.DocMovement;



onMounted(async () => {
  //   setToast(UserDocStore.DocData, toast);
  //   setWatch(UserDocStore.DocData, toast);
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