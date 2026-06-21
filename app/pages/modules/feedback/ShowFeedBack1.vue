<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="main" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <Accordion :activeIndex="0">
      <!-- Отображаем один аккордеон с рейтингом и списком отзывов -->
      <AccordionTab :header="getAccordionHeader()">
        <div v-if="filteredFeedBack.length === 0" class="no-data">
            Отзывов пока нет
        </div>
        <div v-else>
          <div v-for="item in filteredFeedBack as any" :key="item.id" class="feedback-item">
            <p class="m-0">
              <strong>{{ item.User_Name }}</strong> ({{ formatDate(item.rct) }}):
              {{ item.Text }}
            </p>
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { clickBack, formatDate } from '~/utils';
import { useToast } from 'primevue/usetoast';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const toast = useToast();
const route = useRoute();

const Token = localStorage.getItem('Token') || '';
// Интерфейсы для типизации
interface FeedbackItem {
  id: string | number;
  User_Name: string;
  Text: string;
  rct: string | Date;
}

const main = async () => { navigateTo('/'); }

// Реактивные переменные
const filteredFeedBack = ref<FeedbackItem[]>([]);

let typeOfSale, ProductCard_id: any, ServiceCard_id: any;

if (route.query.ProductCard_id) {
  ProductCard_id = route.query.ProductCard_id;
  typeOfSale = "Product";
} else if (route.query.ServiceCard_id) {
  ServiceCard_id = route.query.ServiceCard_id;
  typeOfSale = "Service";
}

const fillEntity = async () => {
    const response = await post({
      module: 'feedback',
      form: 'ShowFeedBack',
      method: 'getShowFeedBack',
      data: { DocMovement: { ProductCard_id, ServiceCard_id } },
      Token,
    });

    // Безопасное извлечение данных
    const serverEntity = Array.isArray(response.Entity) ? response.Entity : [];

    // Заполняем filteredFeedBack только нужными полями
    filteredFeedBack.value = serverEntity.map((item: any) => ({
      id: item.id || Math.random(), // уникальный ключ для v-for
      User_Name: item.User_Name || 'Анонимный пользователь',
      Text: item.Text || 'Отзыв отсутствует',
      rct: item.rct
    }));

    console.log('Полученные отзывы:', filteredFeedBack.value);
};

const getAccordionHeader = () => {
  // Безопасная проверка: если filteredFeedBack.value не определён или не массив, возвращаем 0
  if (!filteredFeedBack.value || !Array.isArray(filteredFeedBack.value)) {
    return 'Отзывы (0)';
  }
  return `Отзывы (${filteredFeedBack.value.length})`;
};

onMounted(() => {
  fillEntity();
});
</script>

<style>
@import 'primeicons/primeicons.css';

.fixed {
  position: sticky;
  width: 100%;
  top: 0px;
  z-index: 99999999;
}

.feedback-item {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
}

.error-message {
  color: #d32f2f;
  text-align: center;
  padding: 1rem;
  background: #ffebee;
  border-radius: 4px;
}
</style>