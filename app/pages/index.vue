<template>
  <div>
    <Toast position="center" />

    <!-- ROW 1: AD & SEARCH -->
    <section class="max-w-[1400px] mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 h-auto md:h-24">
      <div class="flex-1 bg-khaki-dark rounded-3xl flex items-center px-8 text-neon-lemon relative overflow-hidden group border-b-4 border-neon-lemon">
        <div class="relative z-10">
          <span class="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Combo Market</span>
          <p class="text-xl font-black leading-none mt-1">РЕШИМ ЛЮБУЮ ЗАДАЧУ</p>
        </div>
        <div class="absolute right-[-10px] top-[-10px] w-32 h-32 bg-neon-lemon/5 rounded-full blur-2xl"></div>
      </div>

      <div class="flex-[2] flex gap-3">
        <input
          v-model="TextToFilter"
          type="text"
          @keydown.enter="filterFilteredCard"
          placeholder="Поиск категории, услуги или товара..."
          class="flex-1 bg-white shadow-sm text-lg px-6 py-4 rounded-2xl border-none outline-none font-bold"
        />
        <button
          @click="filterFilteredCard"
          class="btn-neon px-12 rounded-2xl text-lg flex items-center justify-center cursor-pointer"
        >
          НАЙТИ
        </button>
      </div>
    </section>

    <!-- ROW 3: ACTION & QUICK CATEGORIES -->
    <section class="max-w-[1400px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div class="min-w-[280px] flex flex-col gap-6">
        <button @click="clickPostAd" class="btn-neon py-6 rounded-[2rem] text-xl tracking-tight shadow-2xl cursor-pointer">
          РАЗМЕСТИТЬ ОБЪЯВЛЕНИЕ
        </button>
        <button @click="showSupportModal" class="flex items-center gap-4 text-khaki-mid font-black px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <span class="text-2xl">🎧</span>
          <span>ТЕХПОДДЕРЖКА</span>
        </button>
      </div>

      <div class="flex-1 bg-white p-8 rounded-[2.5rem] border border-khaki-mid/5 shadow-inner">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-4">
          <div
            v-for="cat in quickCategories"
            :key="cat"
            @click="quickSelect(cat)"
            class="text-[10px] font-black text-khaki-mid uppercase hover:text-neon-lemon cursor-pointer transition-colors"
          >
            {{ cat }}
          </div>
        </div>
      </div>
    </section>

    <!-- ROW 4: PREMIUM SERVICES -->
    <section class="max-w-[1400px] mx-auto px-4 py-10">
      <h3 class="text-2xl font-black mb-8 text-khaki-dark uppercase">Премиум предложения</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div
          v-for="promo in promoCards"
          :key="promo.id"
          @click="selectedPromo = promo"
          class="promo-card cursor-pointer group"
        >
          <img :src="promo.img" :alt="promo.title" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-10"></div>
          <div class="absolute bottom-8 left-8 z-20">
            <span class="px-2 py-1 bg-neon-lemon text-khaki-dark text-[10px] font-black rounded mb-2 inline-block">VIP</span>
            <h4 class="text-lg font-black text-white leading-tight uppercase italic">{{ promo.title }}</h4>
          </div>
        </div>
      </div>
    </section>

    <!-- ROW 5: CATEGORY GRID (CUSTOM SVG ICONS) -->
    <section class="max-w-[1400px] mx-auto px-4 py-12">
      <h3 class="text-2xl font-black mb-8 text-khaki-dark uppercase tracking-tight">Популярные категории</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div
          v-for="(cat, idx) in categories"
          :key="cat.id"
          @click="filterCategories(cat.Name)"
          class="category-card p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center text-center group hover:border-khaki-mid/10"
        >
          <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm group-hover:bg-khaki-dark group-hover:shadow-md transition-all">
            {{ getEmojiForCategory(cat.Name, idx) }}
          </div>
          <span class="text-[10px] font-black text-slate-800 leading-tight uppercase group-hover:text-khaki-mid transition-colors">
            {{ cat.Name }}
          </span>
        </div>
      </div>
    </section>

    <!-- ROW 6: PRODUCT FEED -->
    <section class="max-w-[1400px] mx-auto px-4 py-12 border-t border-khaki-mid/5">
      <div class="flex justify-between items-center mb-8">
        <h3 class="text-2xl font-black text-khaki-dark uppercase">
          {{ isFiltered ? `Результаты поиска` : 'Свежие объявления' }}
        </h3>
        <button
          v-if="isFiltered"
          @click="clearFilters"
          class="text-xs font-bold text-khaki-mid hover:text-neon-lemon uppercase tracking-wider transition-colors"
        >
          Сбросить фильтр &times;
        </button>
      </div>

      <div v-if="FilteredCard.length === 0" class="text-center py-16 bg-white border rounded-[2rem]">
        <p class="text-lg font-bold text-slate-400">Объявлений не найдено.</p>
        <button @click="clearFilters" class="mt-4 text-xs font-black text-khaki-dark hover:text-neon-lemon uppercase underline">
          Показать все
        </button>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div
          v-for="card in FilteredCard"
          :key="card.id"
          @click="selectedProduct = card"
          class="standard-card group"
        >
          <div class="aspect-square bg-slate-100 relative overflow-hidden">
            <img :src="card.imageUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">
            <div class="absolute top-3 left-3 px-2 py-1 bg-khaki-dark text-neon-lemon text-[8px] font-black rounded uppercase">
              {{ card.typeOfSale === 'Service' ? 'Услуга' : 'Товар' }}
            </div>
            <!-- Favorite button -->
            <button
              @click.stop="clickAddToFavorite(card)"
              :disabled="card.inFavorit"
              class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-neon-lemon transition-colors cursor-pointer"
              :class="{ 'text-red-500': card.inFavorit, 'text-slate-400': !card.inFavorit }"
            >
              ❤️
            </button>
          </div>
          <div class="p-5">
            <p class="text-sm font-black text-khaki-dark leading-tight h-10 overflow-hidden">
              {{ card.Name }}
            </p>
            <p class="text-neon-lemon bg-khaki-dark inline-block px-3 py-1 text-xs font-black rounded-lg mt-4">
              {{ card.Price }} ₽
            </p>
            <div class="mt-2 flex items-center gap-1">
              <span class="text-yellow-500 text-xs">⭐</span>
              <span class="text-[10px] font-bold text-slate-400">Рейтинг: {{ card.Level || 5 }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Master Modals Container -->
    <ModalsContainer
      :categories="categories"
      :clickAddToFavorite="clickAddToFavorite"
      :clickShowCard="clickShowCard"
      :filterCategories="filterCategories"
      :clickPostAd="clickPostAd"
    />

    <!-- Local Dialog for Guest Alert -->
    <Dialog v-model:visible="guestAlertVisible" modal header="Пожалуйста войдите или зарегистрируйтесь" :style="{ width: '25rem' }">
      <div class="p-6 text-center">
        <p class="text-sm text-slate-500 mb-6">Для совершения этого действия необходимо войти в систему или создать новый аккаунт.</p>
        <div class="flex gap-4">
          <button @click="navigateToAuth" class="flex-1 btn-neon py-3 rounded-xl uppercase font-bold">Вход</button>
          <button @click="guestAlertVisible = false" class="flex-1 border border-slate-200 py-3 rounded-xl uppercase font-bold text-slate-400 hover:text-slate-600">Отмена</button>
        </div>
      </div>
    </Dialog>

    <!-- Модалка: Создать объявление (восстановленный точный дизайн v1.5.0) -->
    <Transition name="fade">
      <div v-if="visibleCreateCard" class="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md z-[1100]">
        <div class="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-12 overflow-y-auto max-h-[90vh] relative">
          <button @click="visibleCreateCard = false" class="absolute top-6 right-8 text-4xl text-slate-300 hover:text-khaki-dark leading-none">&times;</button>
          
          <h3 class="text-3xl font-black text-khaki-dark mb-8 uppercase">Создать объявление</h3>
          
          <div class="space-y-6">
            <!-- 1. Поле для ввода: Что продаете или предлагаете -->
            <div>
              <AutoComplete 
                v-model="selectedMaterial_Name" 
                :suggestions="filteredMaterial_Name" 
                optionLabel="Name"
                @complete="searchMaterial_Name($event)"
                placeholder="ЧТО ПРОДАЕТЕ ИЛИ ПРЕДЛАГАЕТЕ?"
                class="w-full text-lg"
              />
            </div>

            <!-- 2. Поле: Выбор из каталога -->
            <div>
              <select v-model="selectedCategory" class="w-full font-bold text-khaki-dark border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-neon-lemon bg-white">
                <option :value="null" disabled>Выбор из каталога</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat">
                  {{ cat.Name }}
                </option>
              </select>
            </div>

            <!-- 3. Поле подробного описания с возможностью его расширить (resize-y) -->
            <div>
              <textarea 
                rows="4" 
                v-model="newAd.Description" 
                placeholder="ПОДРОБНОЕ ОПИСАНИЕ..." 
                class="w-full border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-neon-lemon resize-y min-h-[120px] font-semibold text-khaki-dark"
              ></textarea>
            </div>

            <!-- 4. Два поля на одном уровне: цена и локация -->
            <div class="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                v-model="newAd.Price" 
                placeholder="ЦЕНА (₽)" 
                class="w-full border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-neon-lemon font-semibold text-khaki-dark"
              />
              <input 
                type="text" 
                v-model="newAd.Location" 
                placeholder="ЛОКАЦИЯ" 
                class="w-full border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-neon-lemon font-semibold text-khaki-dark"
              />
            </div>

            <!-- Загрузка фото товара (адаптирована визуально) -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label class="block text-xs font-black text-slate-400 mb-2 uppercase">Фото товара (необязательно)</label>
              <FileUpload mode="basic" name="demo[]" :customUpload="true" :auto="true" :maxFileSize="10000000"
                chooseLabel="Выбрать фото" @uploader="myUploaderNewAd" class="w-full" />
              <div v-if="newAdImageUrl" class="mt-3 flex justify-center">
                <Image :src="newAdImageUrl" alt="Фото товара" width="100" class="rounded-xl border border-slate-200" />
              </div>
            </div>

            <!-- 5. Кнопка: Опубликовать -->
            <button 
              @click="submitNewAd" 
              :disabled="creatingAdLoading"
              class="btn-neon w-full py-6 rounded-[2rem] text-2xl uppercase mt-6 cursor-pointer flex items-center justify-center gap-2"
            >
              <span v-if="creatingAdLoading">Публикация...</span>
              <span v-else>Опубликовать</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, unref, toRaw, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { guestReg } from '~/utils'

const toast = useToast()
const runtimeConfig = useRuntimeConfig()

// Initialize Guest Session
await guestReg(runtimeConfig.public.ORG)

const dadataToken = runtimeConfig.public.dadataToken || null
const businessFormName: any = runtimeConfig.public.businessFormName
const Token = localStorage.getItem('Token') || ''

// Geolocation object (Dinar's tracking coordinates)
const location: any = {}

// Composable global states
const {
  showCatalog,
  showCity,
  showReg,
  showLogin,
  showAbout,
  showOrder,
  showSupport,
  selectedCategory,
  selectedProduct,
  selectedPromo,
  currentCity
} = useComboState()

// Geolocation with Dadata Fallback integration
const getGeoposition = () => {
  function handleError(error: any) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        toast.add({ severity: 'warn', summary: 'Доступ к геопозиции отклонен.', life: 3000 })
        break;
      default:
        toast.add({ severity: 'error', summary: 'Ошибка при получении геопозиции.', life: 3000 })
        break;
    }
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      location.latitude = pos.coords.latitude;
      location.longitude = pos.coords.longitude;
      location.accuracy = pos.coords.accuracy;

      const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
      const query = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      const options = {
        method: "POST",
        mode: "cors" as RequestMode,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Token " + dadataToken
        },
        body: JSON.stringify(query)
      }

      fetch(url, options)
        .then(res => res.json())
        .then(result => {
          if (result?.suggestions && result.suggestions.length > 0) {
            const city = result.suggestions[0].data.city;
            currentCity.value = city.toUpperCase()
            toast.add({ severity: 'info', summary: 'Ваш город определен: ' + city, life: 3000 })
          }
        })
        .catch(err => console.log("Geoposition lookup error", err));
    },
    handleError,
    { timeout: 10000 }
  );
}

// Bind default layouts triggers to this component
const triggerCitySelector = () => {
  getGeoposition()
}

// Map helper categories icons dynamically
const getEmojiForCategory = (catName: string, index: number): string => {
  const name = catName.toLowerCase()
  if (name.includes('ремонт') || name.includes('строй')) return '🏗️'
  if (name.includes('транспорт') || name.includes('перевоз')) return '🚚'
  if (name.includes('авто')) return '🔧'
  if (name.includes('it') || name.includes('информа') || name.includes('разраб') || name.includes('дизайн')) return '💻'
  if (name.includes('делов') || name.includes('юрист') || name.includes('бухг')) return '💼'
  if (name.includes('техн') || name.includes('электр') || name.includes('бытов') || name.includes('мобил')) return '📱'
  if (name.includes('обуч') || name.includes('курс') || name.includes('язык')) return '🎓'

  const fallbackEmojis = ['🏗️', '🚚', '🔧', '💻', '💼', '📱', '🎓']
  return fallbackEmojis[index % fallbackEmojis.length]
}

// Guest Checking
const guestAlertVisible = ref(false)
const checkIsGuest = (): boolean => {
  if (localStorage.getItem('isGuest') === 'true') {
    guestAlertVisible.value = true
    return true
  }
  return false
}

const navigateToAuth = () => {
  guestAlertVisible.value = false
  navigateTo('/auth')
}

// Quick Categories Mock
const quickCategories = ["Недвижимость", "Авто", "Транспорт", "Работа", "Электроника", "Одежда", "Хобби", "Для дома", "Животные", "Здоровье"]

// VIP Mock cards
const promoCards = [
  { id: 1, title: "Ремонт домов", img: "https://images.unsplash.com/photo-1503387762-592dea58ef21?auto=format&fit=crop&w=500" },
  { id: 2, title: "Автосервис", img: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=500" },
  { id: 3, title: "IT Решения", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500" },
  { id: 4, title: "Клининг", img: "https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=500" },
  { id: 5, title: "Логистика", img: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=500" }
]

// Demo fallback products from v1.5.0 layout
const demoProducts = [
  { id: 'demo-1', Name: "Ремонт квартир 'Под ключ'", Price: "45 000", typeOfSale: "Service", imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400", Description: "Сделаем быстро, качественно и с гарантией. Работаем по договору. Выезд мастера в течение часа.", Level: 5 },
  { id: 'demo-2', Name: "iPhone 15 Pro Max 256GB", Price: "115 000", typeOfSale: "Product", imageUrl: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=400", Description: "Абсолютно новый, оригинальный телефон в запечатанной коробке. Гарантия 1 год.", Level: 5 },
  { id: 'demo-3', Name: "Грузоперевозки Москва-Сочи", Price: "12 500", typeOfSale: "Service", imageUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400", Description: "Перевезем любой груз быстро и бережно. Опытные водители, чистые машины.", Level: 5 },
  { id: 'demo-4', Name: "Дизайн логотипа и брендбука", Price: "8 000", typeOfSale: "Service", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400", Description: "Разработаем стильный и уникальный дизайн для вашего бизнеса. 3 варианты на выбор.", Level: 5 },
  { id: 'demo-5', Name: "Химчистка мебели", Price: "3 500", typeOfSale: "Service", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400", Description: "Профессиональная чистка диванов, кресел и матрасов на дому. Безопасная химия.", Level: 5 },
  { id: 'demo-6', Name: "Английский для бизнеса", Price: "1 200", typeOfSale: "Service", imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=400", Description: "Индивидуальные занятия с носителем языка. Разговорная практика, деловая переписка.", Level: 5 }
]

// API Data fetching
const FilteredCard: any = ref([])
const EntityFilteredCard: any = ref([])
const TextToFilter = ref('')
let CardEntity: any = []

const fillEntity = async () => {
  try {
    const response = await post({
      module: 'shop',
      form: 'ShowCatalog',
      method: 'getCatalog',
      data: { DocMovement: {} },
      Token,
    })
    const Entity = response?.Entity || []
    CardEntity = []
    CardEntity.push(...Entity)
    FilteredCard.value = []
    EntityFilteredCard.value = []
    
    if (CardEntity.length > 0) {
      for (const { id, Material_Name, Description, FileStorage_id, org, Price, Level = 0, inFavorit, Service_Name, typeOfSale, Analytics } of CardEntity) {
        const nameValue = Material_Name || Service_Name || ''
        const cardData = {
          id,
          Name: nameValue,
          Description,
          Price,
          imageUrl: getImageUrl(FileStorage_id, org),
          Level: Number(Level),
          inFavorit,
          typeOfSale,
          Analytics
        }
        FilteredCard.value.push(cardData)
        EntityFilteredCard.value.push(cardData)
      }
    } else {
      // Фолбэк на демонстрационные товары из v1.5.0, если база данных пуста
      FilteredCard.value = [...demoProducts]
      EntityFilteredCard.value = [...demoProducts]
    }
  } catch (error) {
    console.error('fillEntity error, falling back to demo products:', error)
    FilteredCard.value = [...demoProducts]
    EntityFilteredCard.value = [...demoProducts]
  }
}
fillEntity()

// Search filters
const isFiltered = computed(() => TextToFilter.value && TextToFilter.value.trim() !== '')

const clearFilters = () => {
  TextToFilter.value = ''
  fillEntity()
}

const filterFilteredCard = () => {
  const query = unref(TextToFilter);
  if (!query) {
    clearFilters()
    return
  }

  // Handle autocomplete object vs direct string input
  const queryString = (typeof query === 'object' && query !== null && 'Name' in query) 
    ? (query as any).Name 
    : String(query);

  FilteredCard.value = []
  for (const row of EntityFilteredCard.value) {
    let { Name = '', Description = '' } = row
    Name = Name || ''
    Description = Description || ''
    if (Name.toLowerCase().includes(queryString.toLowerCase())) {
      FilteredCard.value.push(row)
    } else if (Description.toLowerCase().includes(queryString.toLowerCase())) {
      FilteredCard.value.push(row)
    }
  }
}

const quickSelect = (catName: string) => {
  TextToFilter.value = catName
  filterFilteredCard()
}

// Autocomplete suggestions
const getCardNameDictionary = async () => {
  const { Entity = [] } = await post({
    module: 'shop',
    form: 'ShowCatalog',
    method: 'getCardNameDictionary',
    data: { DocMovement: {} },
    Token,
  })
  return Entity
}

const cardNameDictionary: any = await getCardNameDictionary()
const filteredText = ref()

const searchTextToFilter = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredText.value = cardNameDictionary
    } else {
      filteredText.value = cardNameDictionary.filter(({ Name }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase())
      })
    }
  }, 250)
}

// Favorites & Interactions
const clickAddToFavorite = async (data: any) => {
  if (checkIsGuest()) return
  const { id, typeOfSale } = toRaw(data)
  const DocMovement: any = {}
  if (typeOfSale === "Service") DocMovement.ServiceCard_id = id
  else DocMovement.ProductCard_id = id

  const response: any = await post({
    Token: localStorage.getItem('Token') || '',
    module: "shop",
    form: "FavoritesDoc",
    data: { DocMovement }
  })
  if (response?.Error) {
    toast.add({ severity: 'error', summary: response.Error, life: 3000 })
  } else {
    toast.add({ severity: 'success', summary: 'Успешно добавлено в избранное!', life: 2000 })
    FilteredCard.value = FilteredCard.value.map((item: any) =>
      item.id === id ? { ...item, inFavorit: true } : item)
  }
}

// Categories layer
const categories: any = ref([])
const categoriesResponse: any = await post({
  Token: localStorage.getItem('Token') || '',
  module: 'business',
  form: businessFormName,
  method: 'getCategoriesFirstLayer',
  data: { DocMovement: {} }
})
categories.value = categoriesResponse?.Entity || []

const filterCategories = (categoryName: string) => {
  TextToFilter.value = categoryName
  filterFilteredCard()
}

const clickShowCard = (data: any) => {
  selectedProduct.value = null // Close detail modal
  const { id, typeOfSale } = toRaw(data)
  let form = 'ShowProductCard'
  if (typeOfSale === "Service") form = 'ShowServiceCard'
  linkToForm({ module: 'shop', form, id })
}

const enterCardReestr = () => {
  if (checkIsGuest()) return
  return navigateTo('/modules/shop/CardReestr')
}

// --- Dinar's Dictionaries for Form AutoCompletes ---
const MeasureResponse: any = await get({
  Token,
  module: 'dictionary',
  form: 'MeasureDoc',
  id: 0
})
if (MeasureResponse.Error) {
  toast.add({ severity: 'error', summary: MeasureResponse.Error, life: 3000 })
}

const MaterialResponse: any = await get({
  Token,
  module: 'dictionary',
  form: 'MaterialDoc',
  id: 0
})
if (MaterialResponse.Error) {
  toast.add({ severity: 'error', summary: MaterialResponse.Error, life: 3000 })
}

const filteredMaterial_Name = ref()
const selectedMaterial_Name = ref()
const searchMaterial_Name = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredMaterial_Name.value = [...toRaw(MaterialResponse.Entity)]
    } else {
      filteredMaterial_Name.value = toRaw(MaterialResponse.Entity).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase())
      })
    }
  }, 250)
}

const filteredMeasure_Name = ref()
const selectedMeasure_Name = ref()
const searchMeasure_Name = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredMeasure_Name.value = [...toRaw(MeasureResponse.Entity)]
    } else {
      filteredMeasure_Name.value = toRaw(MeasureResponse.Entity).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase())
      })
    }
  }, 250)
}

// --- Post Ad Flow States & Handlers (from Dinar's code, simplified to v1.5.0 layout) ---
const visibleCreateCard = ref(false)
const creatingAdLoading = ref(false)
const newAd = ref({ Description: '', Price: null, Location: '' })
const newAdImageUrl = ref('')
const newAdFileStorage_id = ref(null)

const clickPostAd = () => {
  if (checkIsGuest()) return
  selectedCategory.value = null
  selectedMaterial_Name.value = null
  newAd.value = { Description: '', Price: null, Location: '' }
  newAdImageUrl.value = ''
  newAdFileStorage_id.value = null
  visibleCreateCard.value = true
}

const myUploaderNewAd = async (event: any) => {
  const fileName = event.files[0].name
  const entityRow = await uploadFileStorage(event, {
    module: 'shop',
    form: 'ProductCardDoc',
    data: {
      DocMovement: {
        Text: fileName,
        Date: new Date()
      }
    }
  }, toast)
  if (entityRow.DocData) {
    newAdFileStorage_id.value = entityRow.DocData.FileStorage_id
    newAdImageUrl.value = getImageUrl(entityRow.DocData.FileStorage_id, entityRow.DocData.org)
  }
}

const submitNewAd = async () => {
  const materialName = typeof selectedMaterial_Name.value === 'object' && selectedMaterial_Name.value !== null
    ? selectedMaterial_Name.value.Name
    : String(selectedMaterial_Name.value || '')

  if (!materialName.trim()) {
    toast.add({ severity: 'error', summary: "Поле 'Что продаете или предлагаете' не заполнено", life: 3000 })
    return
  }

  if (!selectedCategory.value) {
    toast.add({ severity: 'error', summary: "Пожалуйста, выберите категорию из каталога", life: 3000 })
    return
  }

  // Автоматически берем дефолтную единицу измерения из справочника, если она есть
  const defaultMeasure = MeasureResponse?.Entity?.[0] || { id: 1, Name: 'шт.' }

  creatingAdLoading.value = true
  try {
    const rawPrice = String(newAd.value.Price || '').replace(/\s/g, '')
    const numericPrice = Number(rawPrice) || null

    let finalDescription = newAd.value.Description || ''
    if (newAd.value.Location) {
      finalDescription += `\n\nЛокация: ${newAd.value.Location}`
    }

    const body = {
      Token,
      module: 'shop',
      form: 'ProductCardDoc',
      data: {
        DocMovement: {
          Category_id: selectedCategory.value?.id,
          Material_Name: materialName,
          Material_id: typeof selectedMaterial_Name.value === 'object' && selectedMaterial_Name.value !== null ? selectedMaterial_Name.value.id : null,
          Measure_Name: defaultMeasure.Name,
          Measure_id: defaultMeasure.id,
          Description: finalDescription,
          Price: numericPrice,
          FileStorage_id: newAdFileStorage_id.value,
          Status: 'draft',
          DictionaryType: 'food',
        },
      },
    }
    const answer: any = await post(body)
    if (answer.Error) {
      toast.add({ severity: 'error', summary: answer.Error, life: 3000 })
      return
    }
    visibleCreateCard.value = false
    toast.add({ severity: 'success', summary: 'Карточка создана как черновик', life: 3000 })
    fillEntity()
  } catch (e) {
    console.error('submitNewAd error:', e)
    toast.add({ severity: 'error', summary: 'Непредвиденная ошибка', life: 3000 })
  } finally {
    creatingAdLoading.value = false
  }
}

const showSupportModal = () => {
  showSupport.value = true
}

// Watchers or updates to hook default layout handlers
watch(showCity, (newVal) => {
  if (newVal) {
    showCity.value = false // bypass dialog, use geolocation
    getGeoposition()
  }
})

watch(showReg, (newVal) => {
  if (newVal) {
    showReg.value = false
    navigateTo('/reg')
  }
})

watch(showLogin, (newVal) => {
  if (newVal) {
    showLogin.value = false
    navigateTo('/auth')
  }
})
</script>

<style scoped>
/* Scoped premium shadows & shapes */
.promo-card {
  height: 320px;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  background-color: #2D3419;
  transition: transform 0.4s;
}
.promo-card:hover {
  transform: scale(1.02);
}

.category-card {
  transition: all 0.3s;
  cursor: pointer;
}
.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.standard-card {
  border-radius: 20px;
  background: white;
  border: 1px solid #eef2e6;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}
.standard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
}

/* Стили для диалога категорий */
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
  transition: all 0.2s;
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

/* Анимация плавного появления модалок */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
