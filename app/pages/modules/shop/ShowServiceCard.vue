<template>
  <Toast />
  <Toolbar>
    <template #start>
      <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'shop', form: 'ShowCatalog' })" />
      <label>|</label>
      <Button icon="pi pi-comment" label="Оставить отзыв о Товаре" @click="clickAddProductFeedBack" />
      <label>|</label>
      <Button icon="pi pi-question-circle" label="Отправить сообщение продавцу" @click="clickAddMessage" />
    </template>
  </Toolbar>
  <div align="center">
    <p />
    <label>{{ ServiceCardDocStore.DocData.DocMovement.Service_Name }}</label>
    <p />
    <label>{{ ServiceCardDocStore.DocData.DocMovement.Price }}</label>
    <p />
    <label>{{ ServiceCardDocStore.DocData.DocMovement.Description }}</label>
  </div>
  <DataTable :value="ServiceCardDocStore.DocData.Entity">
    <Column v-for="column of columns" :key="column.field" :field="column.field">
      <template #body="{ data }">
        <Image v-if="data.Type.indexOf('image') > -1" :src="data.imageUrl" alt="Фото" width="250" preview />
        <video v-if="data.Type.indexOf('video') > -1" controls crossOrigin="anonymous">
          <source :src="data.imageUrl" type="video/mp4">
        </video>
        <audio v-if="data.Type.indexOf('audio') > -1" :src="data.imageUrl" controls />
        <Button v-else :label="data.Name" class="p-button-link"
          @click="downloadFileStorage({ id: data.FileStorage_id, Name: data.Name })" />
        {{ data.Description }}
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();

import { guestReg } from '~/utils';
const runtimeConfig = useRuntimeConfig();
await guestReg(runtimeConfig.public.ORG);

import { useDocHandlerStore } from '~/stores';
const route = useRoute();
const ratingServiceCard = ref(0);

const ServiceCardDocStore = useDocHandlerStore('ServiceCardDoc');
await ServiceCardDocStore.mount({
  module: 'shop',
  form: 'ShowServiceCard',
  id: route.query.id as string
});
if (!toRaw(ServiceCardDocStore.DocData.DocMovement.Active)) {
  toast.add({
    severity: 'error', summary: 'Карточка не активна', life: 3000
  });
  ServiceCardDocStore.DocData.DocMovement = {};
  ServiceCardDocStore.DocData.Entity = [];
  ServiceCardDocStore.DocData.DocMovement.Service_Name = 'Карточка не активна';
}

ServiceCardDocStore.DocData.Entity.forEach((row: any) => {
  row.imageUrl = getImageUrl(row.FileStorage_id, row.org);
  row.Type = row.Type ?? '';
});

console.log('ServiceCardDocStore.DocData.Entity = ', toRaw(ServiceCardDocStore.DocData.Entity));


ratingServiceCard.value = Number(toRaw(ServiceCardDocStore.DocData.DocMovement.Level)) || 0;
const columns = [
  { field: 'Description', header: 'Description' }
];

const clickAddProductFeedBack = () => {
  const ServiceCard_id = route.query.id;
  return navigateTo('/modules/feedback/ProductFeedBackDoc?ProductCard_id=' + ServiceCard_id);
}

const clickAddMessage = async () => {
  const ServiceCard_id = route.query.id;
  const body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'message',
    form: 'MessengerDoc',
    method: 'getMessengerDocByProductCard_id',
    data: { DocMovement: { ServiceCard_id } }
  }
  const answer: any = await post(body);
  if (answer.Error) {
    toast.add({
      severity: 'error', summary: answer.Error, life: 3000
    });
    console.log('Error=', answer.Error);
  } else {
    const id = answer.DocMovement.id;
    // return navigateTo('/modules/message/MessengerDoc/' + id + '?backUrl=/modules/shop/ShowProductCard' + '&ProductCard_id=' + ProductCard_id);
    return navigateTo('/modules/message/MessengerDoc?id=' + id);
  }
}
</script>

<style>
@import 'primeicons/primeicons.css';
</style>