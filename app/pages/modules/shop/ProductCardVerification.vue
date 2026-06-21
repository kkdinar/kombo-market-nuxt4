<template>
  <Toolbar>
    <template #start>
      <Button label="Назад" icon="pi pi-chevron-left"
        @click="clickBack({ module: 'shop', form: 'ProductCardVerificationReestr' })" />
      <label>|</label>
      <Button label="Разрешить к показу" icon="pi pi-eye" @click="verifyProductCard" />
    </template>
  </Toolbar>
  <Toast />
  <div align="center">
    <p />
    <label>{{ ProductCardDocStore.DocData.DocMovement.Material_Name }}</label>
    <p />
    <label>{{ ProductCardDocStore.DocData.DocMovement.Price }}</label>
    <p />
    <label>{{ ProductCardDocStore.DocData.DocMovement.Description }}</label>
  </div>
  <DataTable :value="ProductCardDocStore.DocData.Entity">
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
import { useDocHandlerStore } from '~/stores';
const route = useRoute();
const toast = useToast();

const ProductCardDocStore = useDocHandlerStore('ProductCardDoc');
await ProductCardDocStore.mount({
  module: 'shop',
  form: 'ProductCardVerification',
  id: route.query.id as string
});

ProductCardDocStore.DocData.Entity.forEach((row: any) => {
  row.imageUrl = getImageUrl(row.FileStorage_id, row.org);
  row.Type = row.Type ?? '';
});

const columns = [
  { field: 'Description', header: 'Description' }
];

const verifyProductCard = async () => {
  const { Error, Message }: any = await post({
    module: 'shop',
    form: 'ProductCardVerification',
    method: 'setProductCardActive',
    data: { DocMovement: { id: route.query.id } },
    Token: localStorage.getItem('Token') || ''
  });
  if (Error) {
    toast.add({
      severity: 'error', summary: Error, life: 3000
    });
  }
  if (Message) {
    toast.add({
      severity: 'message', summary: Message, life: 3000
    });

  }
}

</script>

<style>
@import 'primeicons/primeicons.css';
</style>