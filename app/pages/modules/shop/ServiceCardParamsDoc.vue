<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="_clickBack" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
    </div>
  </div>
</template>

<script setup lang="ts">
const Token = localStorage.getItem('Token') || '';
import { InputText } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores';
const route = useRoute();

const visible = ref(false);
const newServiceName = ref('');
const newDescription = ref('');
const ServiceSpecificationList = ref('');
const clickSave = async () => { }
const _clickBack = () => {
  const url = '/modules/shop/ServiceCardDoc?id=' + route.query.id;
  return navigateTo(url);
}

</script>


<style>
/* @import 'primevue/resources/themes/aura-light-green/theme.css'; */
@import 'primeicons/primeicons.css';

.fixed {
  position: sticky;
  /*позицианируем чтобы исчез скролл*/
  width: 100%;
  /*что бы верстка не складывалась по ширине*/
  top: 0px;
  z-index: 99999999;
  /*поверх всех элементов*/
}
</style>