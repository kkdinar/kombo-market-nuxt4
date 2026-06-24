<template>
  <div class="products-page">
    <Toast position="center" />

    <div class="km-header">
      <div class="km-logo">
        <Image src="/logo_kombomarket_1x.jpg" class="km-logo-img" />
        <div class="km-logo-text">
          <h1>Комбо маркет</h1>
          <p>Каждый может больше</p>
        </div>
      </div>

      <div class="km-search">
        <AutoComplete v-model="TextToFilter" :suggestions="filteredText" forceSelection fluid optionLabel="Name"
          @complete="searchTextToFilter($event)" @keydown.enter="filterFilteredCard" placeholder="Поиск категории, услуги или товара…" />
        <Button label="Найти" @click="filterFilteredCard" class="km-find-btn" />
      </div>

      <div class="km-nav">
        <Button label="Каталог" @click="showCategories" class="km-pill" />
        <Button label="Ваш город" @click="getGeoposition" class="km-pill" />
        <Button label="Войти" @click="enterSeller" class="km-pill" />
        <Button icon="pi pi-heart" @click="enterFavoriteDoc" class="km-pill km-pill--icon" aria-label="Избранное" />
      </div>
    </div>

    <div class="km-row">
      <Button label="Разместить объявление" icon="pi pi-pencil" @click="clickPostAd" class="km-post-btn" />
      <div class="km-support">
        <i class="pi pi-headphones" />
        <span>Техподдержка</span>
      </div>
      <div class="km-cats">
        <button v-for="cat in categories" :key="cat.id" class="km-cat" @click="filterCategories(cat.Name)">
          {{ cat.Name }}
        </button>
      </div>
    </div>

    <h1 class="km-section-title">Российские товары и услуги собственного производства</h1>
    <div class="km-type-row">
      <Button label="Товары" @click="enterShowFormProduct" class="km-pill" />
      <Button label="Услуги" @click="enterShowFormService" class="km-pill" />
    </div>

    <div class="product-grid">
      <ProductCardMini v-for="card in FilteredCard" :key="card.id" :card="card" :clickFeedBack="clickFeedBack"
        :clickAddToFavorite="clickAddToFavorite" class="product-card-mini" />
    </div>

    <!-- Гостевой диалог -->
    <Dialog v-model:visible="visible" modal header="Пожалуйста войдите или зарегистрируйтесь" :style="{ width: '20%' }">
      <div align="center">
        <Button label="Вход" @click="enterSeller" />
      </div>
    </Dialog>

    <!-- Шаг 1: выбор категории -->
    <Dialog v-model:visible="visibleCategories" modal header="Выберите категорию" :style="{ width: '420px' }">
      <div class="cat-dialog-grid">
        <button v-for="cat in categories" :key="cat.id" class="cat-dialog-item" @click="selectCategoryForAd(cat)">
          {{ cat.Name }}
        </button>
      </div>
    </Dialog>

    <!-- Шаг 2: основные поля карточки товара, сохраняя стили формы со страницы редактирования -->
    <Dialog v-model:visible="visibleCreateCard" modal header="Новое объявление" :style="{ width: '480px' }">
      <div align="center">
        <div class="selected-category-row">
          <label><b>Категория: </b></label>
          <div class="selected-category-chip">
            {{ selectedCategory?.Name }}
            <button type="button" class="chip-change" @click="backToCategoryStep">Изменить</button>
          </div>
        </div>
        <Divider />

        <label>Выберите наименование товара: </label>
        <AutoComplete v-model="selectedMaterial_Name" :suggestions="filteredMaterial_Name" dropdown optionLabel="Name"
          forceSelection @complete="searchMaterial_Name($event)">
        </AutoComplete>
        <Divider />

        <label>Ед.измерения: </label>
        <AutoComplete v-model="selectedMeasure_Name" :suggestions="filteredMeasure_Name" dropdown optionLabel="Name"
          forceSelection @complete="searchMeasure_Name($event)">
        </AutoComplete>
        <Divider />

        <label>Стоимость: </label>
        <InputNumber id="newAdPrice" v-model="newAd.Price" mode="decimal" :minFractionDigits="2" />
        <label> рублей</label>
        <Divider />

        <label>Описание товара: </label>
        <p />
        <Textarea id="newAdDescription" v-model="newAd.Description" :autoResize="true" rows="6" cols="50" />
        <Divider />

        <FileUpload mode="basic" name="demo[]" :customUpload="true" :auto="true" :maxFileSize="10000000"
          chooseLabel="Выбрать главное фото товара" @uploader="myUploaderNewAd" />
        <p>-</p>
        <Image v-if="newAdImageUrl" :src="newAdImageUrl" alt="Фото товара" width="30%" height="30%" />
      </div>

      <template #footer>
        <Button label="Назад" class="p-button-text" @click="backToCategoryStep" />
        <Button label="Опубликовать" icon="pi pi-check" class="p-button-success" @click="submitNewAd"
          :loading="creatingAdLoading" :disabled="!selectedMaterial_Name || !selectedMeasure_Name" />
      </template>
    </Dialog>

    <!-- Просто справочный список категорий -->
    <Dialog v-model:visible="visibleCategoriesBrowse" modal header="Категории" :style="{ width: '20%' }">
      <div align="center">
        <DataTable :value="categories" v-model:selection="selectedCategories" dataKey="id" size="small">
          <Column field="Name" sortable>
            <template #body="{ data }">
              <Button :label="data.Name" class="p-button-link" @click="filterCategories(data.Name)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const visible = ref(false);
const visibleCategories = ref(false);
const visibleCategoriesBrowse = ref(false);
import { guestReg } from '~/utils';
const runtimeConfig = useRuntimeConfig();
await guestReg(runtimeConfig.public.ORG);
const dadataToken = runtimeConfig.public.dadataToken || null;
const businessFormName: any = runtimeConfig.public.businessFormName;
const Token = localStorage.getItem('Token') || '';

const reg = async () => { navigateTo('/reg?type=seller'); }
const enterSeller = async () => {
  if (checkIsGuest()) navigateTo('/auth');
  else navigateTo('/modules/dictionary/PersonalCabinetSeller');
}
const enterShowFormProduct = async () => {
  //TODO: отфильтровать товары
}
const enterShowFormService = async () => {
  //TODO: отфильтровать сервисы
}

const FilteredCard: any = ref([]);
const EntityFilteredCard: any = ref([]);
const TextToFilter = ref('');
let CardEntity: any = [];

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
    const nameValue = Material_Name || Service_Name || '';
    FilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale, Analytics });
    EntityFilteredCard.value.push({ id, Name: nameValue, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit, typeOfSale, Analytics });
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
  const { Analytics, typeOfSale } = toRaw(data);
  let url = `/modules/feedback/FeedBackDoc?Analytics=` + Analytics + `&typeOfSale=` + typeOfSale;
  return navigateTo(url);
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
    toast.add({ severity: 'error', summary: response.Error, life: 3000 });
  }
  else {
    FilteredCard.value = FilteredCard.value.map((item: any) =>
      item.id === id ? { ...item, inFavorit: true } : item);
  }
}

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
          toast.add({ severity: 'info', summary: 'Ваш город: ' + city, life: 3000 });
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

const showCategories = () => { visibleCategoriesBrowse.value = true; }

const filterCategories = (category: string) => {
  visibleCategories.value = false;
  visibleCategoriesBrowse.value = false;

  if (!category) {
    FilteredCard.value = [...EntityFilteredCard.value];
    return;
  }

  FilteredCard.value = EntityFilteredCard.value.filter((row: any) => {
    const rowCategory = row.CategoryName || row.Category || '';
    return rowCategory.toLowerCase() === category.toLowerCase();
  });

  if (FilteredCard.value.length === 0) {
    toast.add({ severity: 'info', summary: `В категории «${category}» пока нет объявлений`, life: 3000 });
  }
}

// --- Справочники для словарных полей (перенесено со страницы редактирования) ---
const MeasureResponse: any = await get({
  Token,
  module: 'dictionary',
  form: 'MeasureDoc',
  id: 0
});
if (MeasureResponse.Error) {
  toast.add({ severity: 'error', summary: MeasureResponse.Error, life: 3000 });
}

const MaterialResponse: any = await get({
  Token,
  module: 'dictionary',
  form: 'MaterialDoc',
  id: 0
});
if (MaterialResponse.Error) {
  toast.add({ severity: 'error', summary: MaterialResponse.Error, life: 3000 });
}

const filteredMaterial_Name = ref();
const selectedMaterial_Name = ref();
const searchMaterial_Name = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredMaterial_Name.value = [...toRaw(MaterialResponse.Entity)];
    } else {
      filteredMaterial_Name.value = toRaw(MaterialResponse.Entity).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}

const filteredMeasure_Name = ref();
const selectedMeasure_Name = ref();
const searchMeasure_Name = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredMeasure_Name.value = [...toRaw(MeasureResponse.Entity)];
    } else {
      filteredMeasure_Name.value = toRaw(MeasureResponse.Entity).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}

// --- Флоу "Разместить объявление" ---
const selectedCategory: any = ref(null);
const visibleCreateCard = ref(false);
const creatingAdLoading = ref(false);
const newAd = ref({ Description: '', Price: null });
const newAdImageUrl = ref('');
const newAdFileStorage_id = ref(null);

const clickPostAd = () => {
  if (checkIsGuest()) return;
  visibleCategories.value = true;
}

const selectCategoryForAd = (cat: any) => {
  selectedCategory.value = cat;
  visibleCategories.value = false;
  newAd.value = { Description: '', Price: null };
  selectedMaterial_Name.value = null;
  selectedMeasure_Name.value = null;
  newAdImageUrl.value = '';
  newAdFileStorage_id.value = null;
  visibleCreateCard.value = true;
}

const backToCategoryStep = () => {
  visibleCreateCard.value = false;
  visibleCategories.value = true;
}

// Главное фото для новой карточки — заливается сразу, id карточки подставится после создания
const myUploaderNewAd = async (event: any) => {
  const fileName = event.files[0].name;
  const entityRow = await uploadFileStorage(event, {
    module: 'shop',
    form: 'ProductCardDoc',
    data: {
      DocMovement: {
        Text: fileName,
        Date: new Date()
      }
    }
  }, toast);
  if (entityRow.DocData) {
    newAdFileStorage_id.value = entityRow.DocData.FileStorage_id;
    newAdImageUrl.value = getImageUrl(entityRow.DocData.FileStorage_id, entityRow.DocData.org);
  }
}

const submitNewAd = async () => {
  if (!selectedMaterial_Name.value) {
    toast.add({ severity: 'error', summary: "Поле 'Товар' не заполнено", life: 3000 });
    return;
  }
  if (!selectedMeasure_Name.value) {
    toast.add({ severity: 'error', summary: "Поле 'Ед.измерения' не заполнено", life: 3000 });
    return;
  }

  creatingAdLoading.value = true;
  try {
    const body = {
      Token,
      module: 'shop',
      form: 'ProductCardDoc',
      data: {
        DocMovement: {
          Category_id: selectedCategory.value?.id,
          Material_Name: selectedMaterial_Name.value.Name,
          Material_id: selectedMaterial_Name.value.id,
          Measure_Name: selectedMeasure_Name.value.Name,
          Measure_id: selectedMeasure_Name.value.id,
          Description: newAd.value.Description,
          Price: newAd.value.Price,
          FileStorage_id: newAdFileStorage_id.value,
          Status: 'draft',
          DictionaryType: 'food',
        },
      },
    };
    const answer: any = await post(body);
    if (answer.Error) {
      toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
      return;
    }
    visibleCreateCard.value = false;
    toast.add({ severity: 'success', summary: 'Карточка создана как черновик', life: 3000 });
    fillEntity();
  } catch (e) {
    console.error('submitNewAd error:', e);
    toast.add({ severity: 'error', summary: 'Непредвиденная ошибка', life: 3000 });
  } finally {
    creatingAdLoading.value = false;
  }
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

.products-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.km-header {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid #ececec;
  margin-bottom: 20px;
}

.km-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.km-logo-img img {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
}

.km-logo-text h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.km-logo-text p {
  font-size: 10px;
  color: #888;
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.km-search {
  flex: 1;
  min-width: 260px;
  display: flex;
  gap: 8px;
}

.km-search .p-autocomplete {
  flex: 1;
}

.km-find-btn {
  background: #d4f000 !important;
  border: none !important;
  color: #1a1a05 !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.km-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.km-pill {
  border-radius: 999px !important;
  font-size: 13px !important;
  background: #fff !important;
  border: 1px solid #ddd !important;
  color: #1a1a1a !important;
}

.km-pill--icon {
  width: 40px;
  padding: 0 !important;
}

.km-row {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
  align-items: stretch;
}

.km-post-btn {
  background: #d4f000 !important;
  border: none !important;
  color: #1a1a05 !important;
  font-weight: 700 !important;
  border-radius: 16px !important;
  padding: 18px 22px !important;
  min-width: 200px;
}

.km-support {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 16px;
  padding: 14px 20px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.km-cats {
  flex: 1;
  min-width: 260px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 16px;
  padding: 16px 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 24px;
}

.km-cat {
  font-size: 12px;
  font-weight: 700;
  color: #1a1a1a;
  cursor: pointer;
  background: none;
  border: none;
  text-align: left;
  padding: 0;
}

.km-cat:hover {
  color: #6b7a00;
}

.km-section-title {
  font-size: 18px;
  margin-bottom: 12px;
}

.km-type-row {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.cat-dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.cat-dialog-item {
  text-align: left;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #ececec;
  background: #fafafa;
  cursor: pointer;
  font-size: 14px;
}

.cat-dialog-item:hover {
  border-color: #d4f000;
  background: #fbfde6;
}

.selected-category-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.selected-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fbfde6;
  border: 1px solid #d4f000;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
}

.chip-change {
  background: none;
  border: none;
  color: #6b7a00;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}
</style>