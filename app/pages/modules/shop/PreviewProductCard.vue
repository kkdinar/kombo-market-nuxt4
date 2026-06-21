<template>
  <Toolbar>
    <template #start>
      <Button label="Назад" icon="pi pi-chevron-left" @click="_clickBack" />
    </template>
  </Toolbar>
  <div align="center">
    <p />
    <Image :src="imageUrl" alt="Фото товара" width="30%" height="30%" />
    <p />
    <label>{{ ProductCardDocStore.DocData.DocMovement.Material_Name }}</label>
    <p />
    <label>{{ ProductCardDocStore.DocData.DocMovement.Price }} рублей</label>
    <p />
    <label>{{ ProductCardDocStore.DocData.DocMovement.Description }}</label>
  </div>
  <DataTable :value="ProductCardDocStore.DocData.Entity">
    <Column v-for="column of columns" :key="column.field" :field="column.field">
      <template #body="{ data }">
        <Image v-if="data.Type.indexOf('image') > -1" :src="data.imageUrl" alt="Фото" width="250" preview />
        <video v-else-if="data.Type.indexOf('video') > -1" controls crossOrigin="anonymous">
          <source :src="data.imageUrl" type="video/mp4">
        </video>
        <audio v-else-if="data.Type.indexOf('audio') > -1" :src="data.imageUrl" controls />
        <Button v-else :label="data.Name" class="p-button-link"
          @click="downloadFileStorage({ id: data.FileStorage_id, Name: data.Name })" />
        {{ data.Description }}
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useDocHandlerStore } from '~/stores';
const route = useRoute();
const ratingProductCard = ref(0);

const ProductCardDocStore = useDocHandlerStore('ProductCardDoc');
await ProductCardDocStore.mount({
  module: 'shop',
  form: 'ProductCardDoc',
  id: route.query.id as string
});

const imageUrl = ref();
const { FileStorage_id, org } = ProductCardDocStore.DocData.DocMovement;
imageUrl.value = getImageUrl(FileStorage_id, org)

ProductCardDocStore.DocData.Entity.forEach((row: any) => {
  row.imageUrl = getImageUrl(row.FileStorage_id, row.org);
  row.Type = row.Type ?? '';
});

ratingProductCard.value = Number(toRaw(ProductCardDocStore.DocData.DocMovement.Level)) || 0;
const columns = [
  { field: 'Description', header: 'Description' }
];

const _clickBack = () => {
  const url = '/modules/shop/ProductCardDoc?id=' + route.query.id;
  return navigateTo(url);
}
</script>

<style>
@import 'primeicons/primeicons.css';
</style>