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
    <label>{{ ServiceCardDocStore.DocData.DocMovement.Material_Name }}</label>
    <p />
    <label>{{ ServiceCardDocStore.DocData.DocMovement.Price }} рублей</label>
    <p />
    <label>{{ ServiceCardDocStore.DocData.DocMovement.Description }}</label>
  </div>
  <DataTable :value="ServiceCardDocStore.DocData.Entity">
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
const ratingServiceCard = ref(0);

const ServiceCardDocStore = useDocHandlerStore('ServiceCardDoc');
await ServiceCardDocStore.mount({
  module: 'shop',
  form: 'ServiceCardDoc',
  id: route.query.id as string
});

const imageUrl = ref();
const { FileStorage_id, org } = ServiceCardDocStore.DocData.DocMovement;
imageUrl.value = getImageUrl(FileStorage_id, org)

ServiceCardDocStore.DocData.Entity.forEach((row: any) => {
  row.imageUrl = getImageUrl(row.FileStorage_id, row.org);
  row.Type = row.Type ?? '';
});

ratingServiceCard.value = Number(toRaw(ServiceCardDocStore.DocData.DocMovement.Level)) || 0;
const columns = [
  { field: 'Description', header: 'Description' }
];

const _clickBack = () => {
  const url = '/modules/shop/ServiceCardDoc?id=' + route.query.id;
  return navigateTo(url);
}
</script>

<style>
@import 'primeicons/primeicons.css';
</style>