<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'shop', form: 'ShowCatalog' })" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <label>Статус заказа: </label>
      <AutoComplete id="Name" v-model="selectedStatus" :suggestions="filteredStatus" dropdown optionLabel="Name"
        forceSelection @complete="searchStatus($event)">
      </AutoComplete>
      <Divider />
      <label>Заказ готов</label>
      <Checkbox id="Done" :binary="true" @input="inputDone" />
      <Divider />
      <label>Номер: </label>
      {{ BasketDocMovement.id }}
      <Divider />
      <label>Стоимость: </label>
      {{ BasketDocMovement.Price }}
      <Divider />
      <!-- <label>Описание: </label>
      {{ BasketDocMovement.Description }} -->
      <Divider />
      <br>
      <DataTable :value="FilteredEntity" data-key="id" responsiveLayout="scroll">
        <Column field="Material_Name" header="Товар" />
        <Column field="Quantity" header="Количество" :styles="{ width: '1%' }" />
        <Column field="Price" header="Цена" />
      </DataTable>
    </div>
  </div>
</template>


<script setup lang="ts">
const Token = localStorage.getItem('Token') || '';
import { InputText } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores'
import { clickBack } from '~/utils';
const toast = useToast();
const route = useRoute();
const BasketDocMovement: any = [];
const BasketEntity: any = [];
const FilteredEntity: any = ref([]);

const getBasket = async () => {
    const response: any = await post({
    Token: localStorage.getItem('Token') || '',
    module: "shop",
    form: "BasketDoc",
    method: "getDraftBasketDoc", 
  });
  //BasketDocMovement.push(toRaw(response.DocMovement));
  BasketEntity.push(...unref(response.Entity));
  BasketDocMovement.push(unref(response.DocMovement));
  
  FilteredEntity.value = [];
  for (const { id, Material_Name, Price, Quantity} of BasketEntity) {
    FilteredEntity.value.push({ id, Material_Name, Price, Quantity})
  }
}
getBasket();

const OrderStatusResponse: any = await get({
    Token,
    module: 'dictionary',
    form: 'OrderStatusDoc',
    id: 0
  });

  if (OrderStatusResponse.Error) {
    toast.add({
      severity: 'error', summary: OrderStatusResponse.Error, life: 3000
    });
  };

//'Status'
  const filteredStatus = ref();
  const selectedStatus = ref();
  const searchStatus = async ({ query = '' }) => {
    setTimeout(() => {
      if (!query.trim().length) {
        filteredStatus.value = [...toRaw(OrderStatusResponse.Entity)];
      } else {
        filteredStatus.value = toRaw(OrderStatusResponse.Entity).filter(({ Name = '' }: any) => {
          return !!Name?.toLowerCase().includes(query?.toLowerCase());
        });
      }
    }, 250);
  }
  const status = BasketDocMovement.OrderStatus_Name;
  selectedStatus.value = OrderStatusResponse.Entity.find((r: any) => r.Name == status);

const clickSave = async () => {
  // //await BasketDocStore.clickSave();
  //     const body: MessageBody = {
  //     Token: localStorage.getItem('Token') || '',
  //     module: 'shop',
  //     form: 'BasketEntityDoc',
  //     Parent: response.DocMovement.id,
  //     data: { Entity: }
  //   }
  //    console.log('body=', body);

  //   const { Error = null, Message = null } = await post(body);
  //   if (Error === 'Token is expired') {
  //     // return navigateTo('/auth');
  //   }
  //   if (Error) {
  //     DocData.Error = Error;
  //     console.log('Error=', Error);
  //   } else {
  //     DocData.Message = Message || 'Документ сохранён';
  //     // window.location.reload();
  //   }
}

const inputDone = async (value: any) => {
  // if (value) {
  //   selectedStatus.value = OrderStatusResponse.Entity.find((r: any) => r.Type === 'made');
  // }
  // else {
  //   selectedStatus.value = OrderStatusResponse.Entity.find((r: any) => r.Type === 'inwork');
  // }
}

onMounted(async () => {
  // setToast(BasketDocStore.DocData, toast);
  // setWatch(BasketDocStore.DocData, toast);
});
</script>