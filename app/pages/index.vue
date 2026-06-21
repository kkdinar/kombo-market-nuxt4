<template>
  <div class="products-page">
    <Toast position="center" />
    <!-- <div class="grid">
      <div></div>
        <div></div>
        <div></div>
        <div>
       
                       <AutoComplete v-model="TextToFilter" :suggestions="filteredText" forceSelection fluid optionLabel="Name"
              @complete="searchTextToFilter($event)" @keydown.enter="filterFilteredCard" placeholder="Поиск ..." />
              <Button icon="pi pi-search" @click="filterFilteredCard" />
        </div>
      <div>
        <Image src="/logo_kombomarket_1x.jpg" />
      </div>
      <div>
        <h2>КОМБОМАРКЕТ</h2>
      </div>
      <div></div>
      <div>
        <Button label="Войти" @click="enterSeller" /> |
        <Button label="Каталог" @click="showCategories" /> |
        <Button label="Ваш город" @click="getGeoposition" /> |
        <Button label="Избранное" icon="pi pi-heart" @click="enterFavoriteDoc" /> |
        <Button label="Разместить объявление" icon="pi pi-pencil" @click="enterCardReestr" /> |
        <Button label="Техподдержка" icon="pi pi-cog" /> 
      </div>
    </div> -->
    <div>
      <p />
      <table class="table">
        <tr>
          <td>
            <Image src="/logo_kombomarket_1x.jpg" />
            КОМБОМАРКЕТ
          </td>
          <td>
            <AutoComplete v-model="TextToFilter" :suggestions="filteredText" forceSelection fluid optionLabel="Name"
              @complete="searchTextToFilter($event)" @keydown.enter="filterFilteredCard" placeholder="Поиск ..." />
          </td>
          <td>
            <Button icon="pi pi-search" rounded raised @click="filterFilteredCard" label="НАЙТИ" />
          </td>
        </tr>
        <tr>
          <td>
            <h1>Каждый может больше</h1>
          </td>
          <td>
            <Button label="ВОЙТИ" rounded raised @click="enterSeller" /> {{ }}
            <Button label="КАТАЛОГ" rounded raised @click="showCategories" />
          </td>
        </tr>
        <tr>

        </tr>
      </table>
    </div>
    <h1>Российские товары и услуги собственного производства</h1>
    <div class="item">

    </div>
    <div class="item">
      <Button label="Товары" rounded raised @click="enterShowFormProduct" /> {{ }}
      <Button label="Услуги" rounded raised @click="enterShowFormService" />
    </div>
    <!-- <hr style="width: 1200px; height: 1px; background-color: #333; border: none;"> -->

    <div class="product-grid">
      <ProductCardMini v-for="card in FilteredCard" :key="card.id" :card="card" :clickFeedBack="clickFeedBack"
        :clickAddToFavorite="clickAddToFavorite" class = "product-card-mini" style="--image-border-radius: 12px;" />
    </div>

    <Dialog v-model:visible="visible" modal header="Пожалуйста войдите или зарегистрируйтесь" :style="{ width: '20%' }">
      <div align="center">
        <Button label="Вход" @click="enterSeller" />
      </div>
    </Dialog>
    <Dialog v-model:visible="visibleCategories" modal header="Категории" :style="{ width: '20%' }">
      <div align="center">
        <DataTable :value="categories" v-model:selection="selectedCategories" dataKey="id" size="small">
          <!-- <template #header>
            <div class="flex justify-content-between">
              <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
              <label>|</label>
              <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredRows" />
              <label>|</label>
              <Button icon="pi pi-search" @click="filterFilteredRows" aria-label="Submit" />
            </div>
          </template> -->
          <!-- <Column selectionMode="multiple" style="width: 1%" /> -->
          <Column field="Name" sortable>
            <template #body="{ data }">
              <Button :label="data.Name" class="p-button-link" @click="filterCategories(data.Name)" />
            </template>
          </Column>
        </DataTable>
        <p />
        <!-- <Button label="Показать" @click="filterCategories" /> -->
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const visible = ref(false);
const visibleCategories = ref(false);
import { guestReg } from '~/utils';
const runtimeConfig = useRuntimeConfig();
await guestReg(runtimeConfig.public.ORG);
const dadataToken = runtimeConfig.public.dadataToken || null;
const businessFormName: any = runtimeConfig.public.businessFormName;

// const FilterText = ref('');
// const FilteredCard: any = ref([]);
// let CardEntity: any = [];
// const MaterialEntity: any = ref([]);
// const Token = localStorage.getItem('Token') || '';

// const enterBuyer = async () => { navigateTo('/auth?type=buyer'); }
const reg = async () => { navigateTo('/reg?type=seller'); }
const enterSeller = async () => {
  if (checkIsGuest()) navigateTo('/auth');
  else navigateTo('/modules/dictionary/PersonalCabinetSeller');
}
// const enterAdmin = async () => { navigateTo('/auth?type=admin'); }
// const enterShowForm = async () => { navigateTo('/modules/shop/ShowCatalog'); }
const enterShowFormProduct = async () => {
  //TODO: отфильтровать товары
  // navigateTo('/modules/shop/ShowCatalog?filter=product');
}
const enterShowFormService = async () => {
  //TODO: отфильтровать сервисы
  // navigateTo('/modules/shop/ShowCatalog?filter=service'); 
}
// const enterShowServiceForm = async () => { navigateTo('/modules/shop/ShowServiceCatalog'); }
//const enterCabinet = async () => { navigateTo('/modules/dictionary/PersonalCabinetSeller'); }

// const { Entity = [] }: any = await post({
//   module: 'shop',
//   form: 'ShowCatalog',
//   method: 'getCatalog',
//   data: { DocMovement: {} },
//   Token,
// });
// for (const { id, Material_Name, Description, FileStorage_id, org, Price, Level = 0, inFavorit, Service_Name } of Entity) {
//   const nameValue = Material_Name || Service_Name || ''; // приоритет: name → title → пустая строка
//   if (Material_Name && !Service_Name) {
//     MaterialEntity.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale: "Product" })
//   }
//   else {
//     MaterialEntity.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale: "Service" })
//   }
// }

// const fillEntity = async () => {
//   const { Entity = [] } = await post({
//     module: 'shop',
//     form: 'ShowCatalog',
//     method: 'getCatalog',
//     data: { DocMovement: {} },
//     Token,
//   });
//   CardEntity = [];
//   CardEntity.push(...Entity);
//   FilteredCard.value = [];
//   for (const { id, Material_Name, Description, FileStorage_id, org, Price, Level = 0, inFavorit, Service_Name } of CardEntity) {
//     const nameValue = Material_Name || Service_Name || ''; // приоритет: name → title → пустая строка
//     if (Material_Name && !Service_Name) {
//       FilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale: "Product" })
//     }
//     else {
//       FilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale: "Service" })
//     }
//   }
// }
// fillEntity();

// const clickFeedBack = (data: any) => {
//   const { id, typeOfSale } = toRaw(data);
//   if (typeOfSale === "Product") {
//     const url = '/modules/feedback/ShowFeedBack1?ProductCard_id=' + id;
//     return navigateTo(url);
//   }
//   if (typeOfSale === "Service") {
//     const url = '/modules/feedback/ShowFeedBack1?ServiceCard_id=' + id;
//     return navigateTo(url);
//   }
// }

const FilteredCard: any = ref([]);
const EntityFilteredCard: any = ref([]);
const TextToFilter = ref('');
let CardEntity: any = [];
const Token = localStorage.getItem('Token') || '';

const fillEntity = async () => {
  const { Entity = [] } = await post({
    module: 'shop',
    form: 'ShowCatalog',
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
    FilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale, Analytics });
    EntityFilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale, Analytics });
    // }
    // else {
    //   FilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale});
    //   EntityFilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale});
    // }
  }
}
fillEntity();

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
    let { Name = '', Description = '', imageUrl } = row;
    Name = Name || '';
    Description = Description || '';
    if ((Name.toLowerCase()).includes(unref(TextToFilter).toLowerCase())) {
      FilteredCard.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(TextToFilter).toLowerCase())) {
      FilteredCard.value.push(row);
    }
  };
}

const getCardNameDictionary = async () => {
  // Список всех возможных наименований товаров и услуг из словарей
  const { Entity = [] } = await post({
    module: 'shop',
    form: 'ShowCatalog',
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

const checkIsGuest = (): boolean => {
  if (localStorage.getItem('isGuest') === 'true') {
    visible.value = true;
    return true;
  }
  return false
}

const clickFeedBack = (data: any) => {
  if (checkIsGuest()) return;
  const { id, typeOfSale } = toRaw(data);
  //FIXME FeedBackDoc
  let url = '/modules/feedback/ShowFeedBack1?ProductCard_id=' + id;

  if (typeOfSale === "Service") {
    //FIXME ShowFeedBack1
    url = '/modules/feedback/ShowFeedBack1?ServiceCard_id=' + id;
  }
  return navigateTo(url);
}

// const clickAddToFavorite = async (data: any) => {
//   if (localStorage.getItem('isGuest') === 'true') {
//     visible.value = true;
//     return;
//   }
//   const { id, typeOfSale } = toRaw(data);
//   const DocMovement: any = {}
//   if (typeOfSale === "Product") DocMovement.ProductCard_id = id;
//   if (typeOfSale === "Service") DocMovement.ServiceCard_id = id;

//   const response: any = await post({
//     Token: localStorage.getItem('Token') || '',
//     module: "shop",
//     form: "FavoritesDoc",
//     data: { DocMovement }
//   });
//   if (response?.Error) {
//     toast.add({
//       severity: 'error', summary: response.Error, life: 3000
//     });
//   }
//   else {
//     MaterialEntity.value = MaterialEntity.value.map((item: any) =>
//       item.id === id ? { ...item, inFavorit: true } : item);
//   }
// }

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

// const clickShowCard = (data: any) => {
//   const { id, typeOfSale } = toRaw(data);
//   let form = null;
//   if (typeOfSale === "Service") form = 'ShowServiceCard';
//   else form = 'ShowProductCard';
//   linkToForm({ module: 'shop', form, id, });
// }
const location: any = {};

const getGeoposition = () => {
  function handleError(error: any) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert('You denied the request for Geolocation.');
        break;
      case error.POSITION_UNAVAILABLE:
        alert('Location information is unavailable.');
        break;
      case error.TIMEOUT:
        alert('The request to get your location timed out.');
        break;
      case error.UNKNOWN_ERROR:
      default:
        alert('An unknown error occurred while retrieving location.');
        break;
    }
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      location.latitude = pos.coords.latitude;
      location.longitude = pos.coords.longitude;
      location.accuracy = pos.coords.accuracy;

      // console.log('getGeoposition=', location);

      //FIXME сделать сервис определения адреса на бэкенде
      const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
      const query = { lat: location.latitude, lon: location.longitude };

      const options: any = {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Token " + dadataToken
        },
        body: JSON.stringify(query)
      }

      fetch(url, options)
        .then(response => response.json())
        .then(result => {
          const city = result.suggestions[0].data.city;
          toast.add({
            severity: 'info', summary: 'Ваш город: ' + city, life: 3000
          });
          console.log(result.suggestions[0].data)
        })
        .catch(error => console.log("error", error));
    },
    handleError,
    { timeout: 10000 }
  );
}

const categories: any = ref([]);
const selectedCategories: any = ref([]);
const response: any = await post({
  Token: localStorage.getItem('Token') || '',
  module: 'business',
  form: businessFormName,
  method: 'getCategoriesFirstLayer',
  data: { DocMovement: {} }
})
categories.value = response?.Entity || [];

const showCategories = () => { visibleCategories.value = true; }
const filterCategories = (category: string) => {
  // console.log('selectedCategories=', unref(selectedCategories));
  //TODO: запрос на фильтрацию товаров
  console.log('filteredCategories=', category);
  visibleCategories.value = false;
}

const enterFavoriteDoc = () => {
  if (checkIsGuest()) return;
  return navigateTo('/modules/shop/Favorites');
}

const enterCardReestr = () => {
  if (checkIsGuest()) return;
  return navigateTo('/modules/shop/CardReestr');
}

</script>

<style>
@import 'primeicons/primeicons.css';


.grid {
  display: grid;
  grid-template-columns: 300px 300px 300px 300px;
  grid-template-rows: 100px 100px 100px;
  justify-content: center;
}

.item {
  margin-bottom: 50px;
}

/* .advertisement {
  grid-column-start: 1;
  grid-column-end: 3;
  Элемент растянется на две колонки с первой по третью линию
} */
</style>
