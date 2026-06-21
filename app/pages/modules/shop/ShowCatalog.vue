<template>
  <div class="products-page">
    <div class="fixed">
      <Toast position="center" />
      <Toolbar>
        <template #center>
          <Button label="Разместить объявление" icon="pi pi-pencil" @click="enterCardReestr" />
          <p>|</p>
          <Button label="Избранное" icon="pi pi-heart" @click="enterFavoriteDoc" />
          <p>|</p>
          <Button label="Личный кабинет" icon="pi pi-user" @click="enterPersonalCabinet" />
        </template>
      </Toolbar>
    </div>

    <!-- Фильтры и сортировка -->
    <!-- <div class="product-controls">
          <div class="filters">
            <select v-model="selectedCategory" @change="filterProducts">
              <option value="">Все категории</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>

            <input type="text" v-model="searchQuery" placeholder="Поиск товаров..." @input="filterProducts">
          </div>

          <div class="sorting">
            <label>Сортировка:</label>
            <select v-model="sortOption" @change="sortProducts">
              <option value="price-asc">По цене (возрастание)</option>
              <option value="price-desc">По цене (убывание)</option>
              <option value="name-asc">По названию (А-Я)</option>
              <option value="name-desc">По названию (Я-А)</option>
            </select>
          </div>
        </div> -->

    <div>
      <p />
      <table class="table">
        <tr>
          <td colspan="3">
            <AutoComplete v-model="TextToFilter" :suggestions="filteredText" forceSelection fluid optionLabel="Name"
              @complete="searchTextToFilter($event)" @keydown.enter="filterFilteredCard" placeholder="Поиск ..." />
          </td>
          <td>
            <Button icon="pi pi-search" @click="filterFilteredCard" />
          </td>
        </tr>
      </table>
    </div>
    <!-- Список товаров -->
    <p />
    <div class="product-grid">
      <ProductCardMini v-for="card in FilteredCard" :key="card.id" :card="card" :clickFeedBack="clickFeedBack"
        :clickAddToFavorite="clickAddToFavorite" :rating="card.Level" />
    </div>
  </div>
  <Dialog v-model:visible="visible" modal header="Пожалуйста войдите или зарегистрируйтесь" :style="{ width: '20%' }">
    <div align="center">
      <Button label="Вход" @click="enterSeller" />
    </div>
  </Dialog>

</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
const visible = ref(false);

import { guestReg } from '~/utils';
const runtimeConfig = useRuntimeConfig();
await guestReg(runtimeConfig.public.ORG);

const filter = route.query.filter;
//filter = product | service Надо сразу отфильтровать

const checkIsGuest = (): boolean => {
  if (localStorage.getItem('isGuest') === 'true') {
    visible.value = true;
    return true;
  }
  return false
}

const enterSeller = async () => { navigateTo('/auth?type=seller'); }
const enterFavoriteDoc = () => {
  if (checkIsGuest()) return;
  return navigateTo('/modules/shop/Favorites');
}
const enterCardReestr = () => {
  if (checkIsGuest()) return;
  return navigateTo('/modules/shop/CardReestr');
}
const enterPersonalCabinet = async () => {
  if (checkIsGuest()) return;
  navigateTo('/modules/dictionary/PersonalCabinetSeller');
}

const FilteredCard: any = ref([]);
const EntityFilteredCard: any = ref([]);
const TextToFilter = ref('');
let CardEntity: any = [];
const Token = localStorage.getItem('Token') || '';

const fillEntity = async () => {
  const { Entity = [] } = await post({
    module: 'shop',
    form: 'ShopData',
    method: 'getCatalog',
    data: { DocMovement: {} },
    Token,
  });
  CardEntity = [];
  CardEntity.push(...Entity);
  FilteredCard.value = [];
  for (const { id, Material_Name, Description, FileStorage_id, org, Price, Level = 0, inFavorit, Service_Name, typeOfSale, Analytics } of CardEntity) {
    const nameValue = Material_Name || Service_Name || ''; // приоритет: name → title → пустая строка
 //   if (Material_Name && !Service_Name) {
      FilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale, Analytics});
      EntityFilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale, Analytics});
    // }
    // else {
    //   FilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale});
    //   EntityFilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale});
    // }
  }
}
fillEntity();

const clickFeedBack = (data: any) => {
  if (checkIsGuest()) return;
  const { Analytics, typeOfSale } = toRaw(data);
  //FIXME FeedBackDoc
  let url = `/modules/feedback/FeedBackDoc?Analytics=` + Analytics + `&typeOfSale=`+typeOfSale;
  console.log('url = ', url);

  // if (typeOfSale === "Service") {
  //   //FIXME ShowFeedBack1
  //   url = '/modules/feedback/FeedBackDoc?ServiceCard_id=' + Analytics;
  // }
  return navigateTo(url);
}

const clearFilters = () => {
  TextToFilter.value = '';
  fillEntity();
}
const filterFilteredCard = () => {
  if (!TextToFilter.value) {
    clearFilters();
    return;
  }
  FilteredCard.value = [];
  for (const row of EntityFilteredCard.value) {
    let { Name = '', Description = '', imageUrl} = row;
    Name = Name || '';
    Description = Description || '';
    if ((Name.toLowerCase()).includes(unref(TextToFilter).toLowerCase())) {
      FilteredCard.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(TextToFilter).toLowerCase())) {
      FilteredCard.value.push(row);
    }
  };
}

const clickAddToFavorite = async (data: any) => {
  if (checkIsGuest()) return;
  const { id, typeOfSale } = toRaw(data);
  const DocMovement: any = {}
  if (typeOfSale === "Service") DocMovement.ServiceCard_id = id;
  else DocMovement.ProductCard_id = id;

  const response: any = await post({
    Token: localStorage.getItem('Token') || '',
    module: "shop",
    form: "FavoritesDoc",
    data: { DocMovement }
  });
  if (response?.Error) {
    toast.add({
      severity: 'error', summary: response.Error, life: 3000
    });
  }
  else {
    FilteredCard.value = FilteredCard.value.map((item: any) =>
      item.id === id ? { ...item, inFavorit: true } : item);
  }
}

const getCardNameDictionary = async () => {
  // Список всех возможных наименований товаров и услуг из словарей
  const { Entity = [] } = await post({
    module: 'shop',
    form: 'ShopData',
    method: 'getCardNameDictionary',
    data: { DocMovement: {} },
    Token,
  });
  return Entity
}

const cardNameDictionary: any = await getCardNameDictionary();

const filteredText = ref();
const searchTextToFilter = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredText.value = cardNameDictionary;
    } else {
      filteredText.value = cardNameDictionary.filter(({ Name }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
</script>

<style></style>