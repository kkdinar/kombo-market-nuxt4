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

    <!-- <div class="fixed-size-div">
      <Image :src="photoUrl" alt="Фото" loading="lazy" />
    </div> -->
    <!-- <Galleria :value="displayImages" :responsiveOptions="responsiveOptions" :numVisible="5"
      containerStyle="max-width: 300px" :showItemNavigators="true" :showThumbnails="true">
      <template #item="slotProps">
        <img :src="slotProps.item.src" :alt="slotProps.item.alt" style="width: 100%" />
      </template>
      <template #thumbnail="slotProps">
        <img :src="slotProps.item.thumbnailSrc" :alt="slotProps.item.alt" />
      </template>
    </Galleria> -->
    <Galleria :value="displayImages" :responsiveOptions="responsiveOptions" :numVisible="5"
      containerStyle="max-width: 600px; margin: 0 auto" :showItemNavigators="true" :showThumbnails="true"
      :circular="true" :autoPlay="false" :transitionInterval="4000"
      :itemContainerStyle="{ 'overflow': 'hidden', 'border-radius': '12px', 'box-shadow': '0 4px 12px rgba(0,0,0,0.15)' }">
      <template #item="slotProps">
        <div class="galleria-item-wrapper">
          <img :src="slotProps.item.src" :alt="slotProps.item.alt" class="galleria-image" />
        </div>
      </template>
      <template #thumbnail="slotProps">
        <div class="galleria-thumbnail-wrapper">
          <img :src="slotProps.item.thumbnailSrc" :alt="slotProps.item.alt" class="galleria-thumbnail" />
        </div>
      </template>
    </Galleria>
    <p />
    <Rating v-model="levelRef.Level" readonly :cancel="false" />
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

    <!-- <DataTable :value="ProductCardDocStore.DocData.Entity">
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
    </DataTable> -->
    <div class="card md:flex md:justify-content-center">
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
//const displayImages = ref([]);
const displayImages = ref();
const visible = ref(false);
const visiblePhone = ref(false);
const Token = localStorage.getItem('Token') || '';
const levelRef: any = ref([]);
let Level: any = [];

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

if (ProductCardDocStore.DocData.DocMovement) {
  const { Entity = [] } = await post({
    module: 'shop',
    form: 'ShowCatalog',
    method: 'getLevel',
    data: { DocMovement: { Analytics: ProductCardDocStore.DocData.DocMovement.Analytics } },
    Token,
  });

  if (Entity.length === 1) {
    if (Entity[0]) {
      levelRef.value = Entity[0];
    }
    //CardEntity.value = { id: runtimeConfig.public.ORG }
  }
  console.log('Entity = ', Entity);
  console.log('levelRef = ', levelRef.value);
}

const { FileStorage_id, org } = ProductCardDocStore.DocData.DocMovement;
const photoUrl: any = ref();
photoUrl.value = getImageUrl(FileStorage_id, org);

// 1. Создаем пустой массив для всех картинок галереи
const allGalleryImages: any[] = [];

// 2. Добавляем ГЛАВНОЕ фото из DocMovement (если оно есть)
const mainPhotoId = ProductCardDocStore.DocData.DocMovement?.FileStorage_id;
const mainOrg = ProductCardDocStore.DocData.DocMovement?.org;

if (mainPhotoId && mainOrg) {
  const mainUrl = getImageUrl(mainPhotoId, mainOrg);
  allGalleryImages.push({
    src: mainUrl,
    thumbnailSrc: mainUrl, // Для миниатюры можно использовать тот же URL или сгенерировать маленький
    alt: ProductCardDocStore.DocData.DocMovement.Material_Name || 'Главное фото',
    isMain: true,           // Флаг, чтобы знать, что это главное фото (опционально)
    originalRow: ProductCardDocStore.DocData.DocMovement // Сохраняем исходные данные
  });
}

// 3. Добавляем остальные фото из Entity
ProductCardDocStore.DocData.Entity.forEach((row: any) => {
  // Сначала обогащаем сам row данными (как ты хотел)
  row.item = getImageUrl(row.FileStorage_id, row.org);
  row.Type = row.Type ?? '';

  // Потом добавляем в общий массив галереи
  if (row.FileStorage_id && row.org) {
    const imgUrl = row.item; // Используем уже рассчитанный URL
    allGalleryImages.push({
      src: imgUrl,
      thumbnailSrc: imgUrl,
      alt: row.Material_Name || `Фото товара ${row.FileStorage_id}`,
      isMain: false,
      originalRow: row
    });
  }
});

// 4. Присваиваем результат в реактивную переменную
displayImages.value = allGalleryImages;

// ProductCardDocStore.DocData.Entity.forEach((row: any) => {
//   row.item = getImageUrl(row.FileStorage_id, row.org);
//   row.Type = row.Type ?? '';
// });
// console.log('ProductCardDocStore.DocData.Entity = ', toRaw(ProductCardDocStore.DocData.Entity));


// // Обработка изображений
// const processedImages = ProductCardDocStore.DocData.Entity
//   .filter((row: any) => row.FileStorage_id) // только с FileStorage_id
//   .map((row: any) => ({
//     src: getImageUrl(row.FileStorage_id, row.org),
//     thumbnailSrc: getImageUrl(row.FileStorage_id, row.org), // миниатюра
//     alt: row.Material_Name || 'Товар',
//     originalRow: row
//   }));

//displayImages.value = processedImages;

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

.galleria-item-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  /* Фиксированная высота галереи */
  display: flex;
  align-items: center;
  justify-content: center;
}

.galleria-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* Сохраняет пропорции изображения */
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.galleria-image:hover {
  transform: scale(1.02);
  /* Лёгкое увеличение при наведении */
}

.galleria-thumbnail-wrapper {
  padding: 4px;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.p-galleria .p-galleria-thumbnail-container .p-galleria-thumbnail-wrapper.p-highlight .galleria-thumbnail-wrapper {
  border-color: #2196F3;
  /* Подсветка активной миниатюры */
}

.galleria-thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.galleria-thumbnail:hover {
  transform: scale(1.05);
  /* Увеличение миниатюры при наведении */
}

/* Стили для навигационных кнопок */
.p-galleria .p-galleria-item-navigator {
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.p-galleria .p-galleria-item-navigator:hover {
  background-color: rgba(255, 255, 255, 0.95);
  transform: scale(1.1);
  /* Анимация при наведении на кнопки */
}

/* Улучшение индикатора прогресса */
.p-galleria .p-galleria-indicator {
  margin: 0 4px;
}

.p-galleria .p-galleria-indicator-item {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ddd;
  transition: background-color 0.2s ease;
}

.p-galleria .p-galleria-indicator-item.p-highlight {
  background-color: #2196F3;
  /* Цвет активного индикатора */
}
</style>