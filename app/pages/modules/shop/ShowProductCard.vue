<template>
  <div class="products-page">
    <Toast position="center" />
    <Toolbar>
      <template #center>
        <Button label="Назад" icon="pi pi-chevron-left" @click="main" />
        <label>|</label>
        <Button icon="pi pi-comment" label="Оставить отзыв о Товаре" @click="clickAddProductFeedBack" />
        <!-- <label>|</label> -->
        <!-- <Rating v-model="ratingProductCard" readonly :cancel="false" /> -->
        <label>|</label>
        <Button icon="pi pi-comments" label="Отправить сообщение продавцу" @click="clickAddMessage" />
        <label>|</label>
        <Button icon="pi pi-phone" label="Показать контакты продавца" @click="clickShowPhone" />
      </template>
    </Toolbar>

    <div class="fixed-size-div">
      <Image :src="photoUrl" alt="Фото" loading="lazy" />
    </div>
    <p />
    <Rating v-model="ProductCardDocStore.DocData.DocMovement.Level" readonly :cancel="false" />
    <p />
    <label>
      <h3>{{ ProductCardDocStore.DocData.DocMovement.Material_Name }}</h3>
    </label>
    <p />
    <label>
      <h3>{{ ProductCardDocStore.DocData.DocMovement.Price }} рублей</h3>
    </label>
    <p />
    <label>
      <h3>{{ ProductCardDocStore.DocData.DocMovement.Description }}</h3>
    </label>

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
    <div class="card md:flex md:justify-content-center">
      <Galleria :value="[
        { item: 'http://localhost:3002/download?org=1&module=filestorage&form=FileStorage&id=60&Token=...' }
      ]" :responsiveOptions="responsiveOptions" :numVisible="5" containerStyle="max-width: 640px"
        :showItemNavigators="true">
        <template #item="data">
          <img :src="data.item" :alt="data.item.alt || 'Изображение товара'" style="width: 100%" />
        </template>
        <template #thumbnail="data">
          <img :src="data.item" :alt="data.item.alt || 'Миниатюра'" />
        </template>
      </Galleria>
      <Dialog v-model:visible="visible" modal header="Пожалуйста войдите или зарегистрируйтесь"
        :style="{ width: '20%' }">
        <div align="center">
          <Button label="Вход" @click="enterSeller" />
        </div>
      </Dialog>
      <Dialog v-model:visible="visiblePhone" modal header="Контакты продавца" :style="{ width: '20%' }">
        <div align="center">
          <label v-if="SellerContactData?.Email">{{ SellerContactData.Email }}</label>
          <p />
          <label v-if="SellerContactData?.Telephone">{{ SellerContactData.Telephone }}</label>
          <p />
          <label v-if="SellerContactData?.Url">{{ SellerContactData.Url }}</label>
          <p />
          <label v-if="SellerContactData?.Address">{{ SellerContactData.Address }}</label>
          <p />
          <Button type="button" label="Отмена" @click="exitPhone" />
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import Galleria from 'primevue/galleria';
const toast = useToast();
const isLoading = ref(true);
const isActive = ref(true);
const displayImages = ref([]);
const visible = ref(false);
const visiblePhone = ref(false);

import { guestReg } from '~/utils';
const runtimeConfig = useRuntimeConfig();
await guestReg(runtimeConfig.public.ORG);

import { useDocHandlerStore } from '~/stores';
const route = useRoute();
const ratingProductCard = ref(0);

// const reg = async () => { navigateTo('/reg?type=seller'); }
const enterSeller = async () => { navigateTo('/auth'); }
const main = async () => { navigateTo('/'); }

const ProductCardDocStore = useDocHandlerStore('ProductCardDoc');
await ProductCardDocStore.mount({
  module: 'shop',
  form: 'ShowProductCard',
  id: route.query.id as string
});
if (!toRaw(ProductCardDocStore.DocData.DocMovement.Active)) {
  toast.add({
    severity: 'error', summary: 'Карточка не активна', life: 3000
  });
  ProductCardDocStore.DocData.DocMovement = {};
  ProductCardDocStore.DocData.Entity = [];
  ProductCardDocStore.DocData.DocMovement.Material_Name = 'Карточка не активна';
}

const { FileStorage_id, org } = ProductCardDocStore.DocData.DocMovement;
const photoUrl: any = ref();
photoUrl.value = getImageUrl(FileStorage_id, org);

ProductCardDocStore.DocData.Entity.forEach((row: any) => {
  row.item = getImageUrl(row.FileStorage_id, row.org);
  row.Type = row.Type ?? '';
});
console.log('ProductCardDocStore.DocData.Entity = ', toRaw(ProductCardDocStore.DocData.Entity));


// Обработка изображений
const processedImages = ProductCardDocStore.DocData.Entity
  .filter((row: any) => row.FileStorage_id) // только с FileStorage_id
  .map((row: any) => ({
    src: getImageUrl(row.FileStorage_id, row.org),
    thumbnailSrc: getImageUrl(row.FileStorage_id, row.org), // миниатюра
    alt: row.Material_Name || 'Товар',
    originalRow: row
  }));

displayImages.value = processedImages;

ratingProductCard.value = Number(toRaw(ProductCardDocStore.DocData.DocMovement.Level)) || 0;
const columns = [
  { field: 'Description', header: 'Description' }
];

const ProductCard_id = route.query.id;

const clickAddProductFeedBack = () => {
  if (localStorage.getItem('isGuest') === 'true') {
    visible.value = true;
    return;
  }
  return navigateTo('/modules/feedback/FeedBackDoc?ProductCard_id=' + ProductCard_id);
}

const clickAddMessage = async () => {
  if (localStorage.getItem('isGuest') === 'true') {
    visible.value = true;
    return;
  }
  const body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'message',
    form: 'MessengerDoc',
    method: 'getMessengerDocByProductCard_id',
    data: { DocMovement: { ProductCard_id } }
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

const SellerContactData: any = ref();

const clickShowPhone = async () => {
  if (localStorage.getItem('isGuest') === 'true') {
    visible.value = true;
    return;
  }
  const body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'shop',
    form: 'ShowCatalog',
    method: 'getSellerContactDataByProductCard_id',
    data: { DocMovement: { ProductCard_id } }
  }
  const answer: any = await post(body);
  if (answer.Error) {
    toast.add({
      severity: 'error', summary: answer.Error, life: 3000
    });
    console.log('Error=', answer.Error);
  } else {
    SellerContactData.value = answer.DocMovement;
  }
  visiblePhone.value = true;
}
const exitPhone = () => {
  SellerContactData.value = {};
  visiblePhone.value = false;
}

const responsiveOptions = ref([
  {
    breakpoint: '991px',
    numVisible: 4
  },
  {
    breakpoint: '767px',
    numVisible: 3
  },
  {
    breakpoint: '575px',
    numVisible: 1
  }
]);
</script>

<style>
@import 'primeicons/primeicons.css';

.products-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.fixed-size-div {
  width: 300px;
  /* Фиксированная ширина */
  height: 300px;
  /* Фиксированная высота */
  overflow: hidden;
}
</style>