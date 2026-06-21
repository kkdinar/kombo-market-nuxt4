<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <label>История продаж:</label>
    </div>
  </div>
</template>


<script setup lang="ts">
// import { useToast } from 'primevue/usetoast';
// const toast = useToast();
// const route = useRoute();
// const TgLogDocStore = useDocHandlerStore('TgLogDoc');
// await TgLogDocStore.mount({
//   module: 'shop',
//   form: 'TgLogDoc',
//   id: route.query.id as string
// });
// console.log('TgLogDocStore', toRaw(TgLogDocStore.DocData.DocMovement.Text));


// onMounted(async () => {
//   setToast(TgLogDocStore.DocData, toast);
//   setWatch(TgLogDocStore.DocData, toast);
// });
</script>