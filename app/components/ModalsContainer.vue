<template>
  <div>
    <!-- 1. Modal: Full Catalog (showCatalog) -->
    <Dialog
      v-model:visible="showCatalog"
      modal
      :dismissableMask="true"
      :showHeader="false"
      class="dark-dialog"
      :style="{ width: '50rem', maxWidth: '90vw' }"
    >
      <div class="p-6">
        <div class="border-b border-white/10 pb-6 flex justify-between items-center mb-8">
          <h3 class="text-4xl font-black text-neon-lemon italic">КАТАЛОГ КАТЕГОРИЙ</h3>
          <button
            @click="showCatalog = false"
            class="w-12 h-12 rounded-full bg-neon-lemon text-khaki-dark text-2xl font-black flex items-center justify-center transition-transform hover:rotate-90"
          >
            &times;
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat.Name)"
            class="w-full text-left p-5 rounded-2xl hover:bg-neon-lemon hover:text-khaki-dark border border-white/10 font-black uppercase text-white flex justify-between group transition-all"
          >
            <span>{{ cat.Name }}</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </Dialog>

    <!-- 2. Modal: About Us (showAbout) -->
    <Dialog
      v-model:visible="showAbout"
      modal
      :dismissableMask="true"
      :showHeader="false"
      class="dark-dialog"
      :style="{ width: '40rem', maxWidth: '90vw' }"
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-4xl font-black text-neon-lemon italic uppercase tracking-tighter">О Комбо Маркете</h3>
          <button @click="showAbout = false" class="text-3xl text-neon-lemon hover:text-white leading-none">&times;</button>
        </div>
        <div class="space-y-6 text-lg font-medium opacity-90 leading-relaxed text-white">
          <p>Мы создали <span class="text-neon-lemon font-black italic">COMBO MARKET</span> как пространство, где каждый может найти больше возможностей.</p>
          <p>Наша платформа объединяет современные веб-технологии с удобством классических объявлений. Быстро. Просто. Надежно.</p>
        </div>
        <button @click="showAbout = false" class="mt-10 btn-neon px-12 py-4 rounded-2xl">ПОНЯТНО</button>
      </div>
    </Dialog>

    <!-- 3. Modal: Product Details (selectedProduct) -->
    <Dialog
      v-model:visible="isProductVisible"
      modal
      :dismissableMask="true"
      :showHeader="false"
      :style="{ width: '64rem', maxWidth: '95vw' }"
    >
      <div class="flex flex-col md:flex-row min-h-[500px]">
        <div class="flex-1 bg-slate-900 relative">
          <img :src="selectedProduct?.imageUrl" class="w-full h-full object-cover min-h-[300px] md:min-h-[500px] opacity-85">
          <div class="absolute top-8 left-8 px-4 py-2 bg-neon-lemon text-khaki-dark font-black rounded-xl uppercase text-xs">
            {{ selectedProduct?.typeOfSale === 'Service' ? 'Услуга' : 'Товар' }}
          </div>
        </div>
        <div class="flex-1 p-10 overflow-y-auto flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-3xl font-black text-khaki-dark leading-tight">
                {{ selectedProduct?.Name }}
              </h3>
              <button @click="selectedProduct = null" class="text-4xl text-slate-300 hover:text-khaki-dark leading-none">&times;</button>
            </div>
            <p class="text-3xl font-black text-khaki-mid mb-8">{{ selectedProduct?.Price }} ₽</p>
            <div class="space-y-6">
              <div class="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                <h4 class="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Информация</h4>
                <p class="text-xs text-khaki-mid mt-1 font-bold">⭐ Рейтинг: {{ selectedProduct?.Level || 5.0 }}</p>
              </div>
              <div class="space-y-2">
                <h4 class="text-[10px] font-black uppercase text-slate-400 mb-1">Описание</h4>
                <p class="text-slate-600 font-medium leading-relaxed italic">
                  {{ selectedProduct?.Description || 'Описание отсутствует.' }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-8 flex gap-4">
            <button @click="clickAddToFavorite(selectedProduct)" class="flex-1 btn-neon py-5 rounded-[1.5rem] text-lg uppercase transition-all" :disabled="selectedProduct?.inFavorit">
              {{ selectedProduct?.inFavorit ? 'В избранном' : 'В избранное' }}
            </button>
            <button @click="clickShowCard(selectedProduct)" class="px-8 py-5 bg-khaki-dark text-white rounded-[1.5rem] font-black uppercase hover:bg-khaki-mid transition-colors">
              Открыть
            </button>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- 4. Modal: Promo Detail (selectedPromo) -->
    <Dialog
      v-model:visible="isPromoVisible"
      modal
      :dismissableMask="true"
      :showHeader="false"
      :style="{ width: '28rem' }"
      class="border-b-[15px] border-khaki-dark"
    >
      <div class="p-6 text-center">
        <div class="w-20 h-20 bg-neon-lemon rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span class="text-3xl font-black text-khaki-dark italic">C</span>
        </div>
        <h3 class="text-2xl font-black text-khaki-dark mb-4 uppercase italic">
          {{ selectedPromo?.title }}
        </h3>
        <p class="text-slate-500 font-bold mb-8">Эксклюзивное предложение от партнеров Combo Market со скидкой до 30%</p>
        <div class="space-y-3">
          <button @click="applyPromo" class="btn-neon w-full py-5 rounded-2xl text-xl">ХОЧУ ТАКУЮ УСЛУГУ</button>
          <button @click="selectedPromo = null" class="w-full text-slate-400 hover:text-slate-600 font-bold text-xs uppercase py-2">Закрыть</button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  categories: any[]
  clickAddToFavorite: Function
  clickShowCard: Function
  filterCategories: Function
  clickPostAd: Function
}>()

const {
  showCatalog,
  showAbout,
  selectedProduct,
  selectedPromo,
  showOrder
} = useComboState()

// Computed properties for v-model mapping since Dialog component uses writable boolean ref
const isProductVisible = computed({
  get: () => selectedProduct.value !== null,
  set: (val) => { if (!val) selectedProduct.value = null }
})

const isPromoVisible = computed({
  get: () => selectedPromo.value !== null,
  set: (val) => { if (!val) selectedPromo.value = null }
})

const selectCategory = (catName: string) => {
  props.filterCategories(catName)
  showCatalog.value = false
}

const applyPromo = () => {
  selectedPromo.value = null
  if (props.clickPostAd) {
    props.clickPostAd()
  }
}
</script>
