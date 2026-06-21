<template>
  <div>
    <div align="center">
      <Image src="/logo_kombomarket_1x.jpg" @click="toBegin" />
      <p />
      <Button label="Войти" @click="enterForm" />
    </div>
    <Toast />
    <h1 align="center">Каталог услуг</h1>
    <p />
      <Button label="Корзина" @click="enterBasketDoc" />
    <p />
    <DataTable :value="FilteredService" data-key="id" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-between">
          <Button type="button" icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined"
            @click="clearFilters" />
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredService" />
          <Button icon="pi pi-search" @click="filterFilteredService" />
        </div>
      </template>
      <Column field="Image" style="width: 20%">
        <template #body="{ data }">
          <Image :src="data.imageUrl" alt="Фото" style="width: 100%" @click="
            linkToForm({
              module: 'shop',
              form: 'ShowServiceCard',
              id: data.id,
            })
            " />
        </template>
      </Column>
      <Column style="width: 80%">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <p />
            <Badge :value="data.Price"></Badge>
            <p />
            <!-- <span>{{ data.Name }}</span> -->
            <Button :label="data.Name" class="p-button-link" @click="
              linkToForm({
                module: 'shop',
                form: 'ShowServiceCard',
                id: data.id,
              })
              " />
            <p />
            <span>{{ data.Description }}</span>
            <p />
            <Rating v-model="data.Level" readonly :cancel="false" />
            <p />
            <Button label="Отзывы" class="p-button-link" @click="
              linkToForm({
                module: 'feedback',
                form: 'ShowProductFeedBack',
                id: data.id,
              })
              " />
             <Button icon="pi pi-cart-arrow-down" label="В корзину" @click="clickAddToBasket(data)" />
            <label>_</label>
            <!--<Button icon="pi pi-heart" label="В избранное" @click="clickAddToFavorite(data)" />
            <p />
       
            <p /> 
            <Button icon="pi pi-comments" label="Отзывы" @click="linkToForm({
                module: 'feedback',
                form: 'ProductFeedBackReestr',
                id: data.id,
              })" /> -->
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();

import { guestReg } from '~/utils';
const runtimeConfig = useRuntimeConfig();
await guestReg(runtimeConfig.public.ORG);

const enterForm = async () => { navigateTo('/auth'); }
const toBegin = async () => { navigateTo('/'); }

const FilteredService: any = ref([]);
const FilterText = ref('');
const ServiceEntity: any = [];

const fillEntity = async () => {
  const Token = localStorage.getItem('Token') || '';
  const { Entity = [] } = await post({
    module: 'shop',
    form: 'ShowServiceCatalog',
    method: 'getServiceCatalog',
    data: { DocMovement: {} },
    Token,
  });
  ServiceEntity.push(...unref(Entity));
  console.log('unref(Entity) = ', unref(Entity));
  FilteredService.value = [];
  for (const { id, Service_Name, Description, FileStorage_id, org, Price, Level = 0 } of ServiceEntity) {
    FilteredService.value.push({ id, Name: Service_Name, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level) })
  }
}
fillEntity();



const clearFilters = () => {
  FilterText.value = '';
  fillEntity();
}
const filterFilteredService = () => {
  FilteredService.value = [];
  ServiceEntity.forEach((row: any) => {
    let { Name = '', Description = '', FileStorage_id, org } = row;
    Name = Name || '';
    Description = Description || '';
    row.imageUrl = getImageUrl(FileStorage_id, org)
    if ((Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredService.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredService.value.push(row);
    }
  });
}

const enterBasketDoc = () => {
  return navigateTo('/modules/shop/BasketDoc');
}

const clickAddToBasket = async (data: any) => {
  const response: any = await post({
    Token: localStorage.getItem('Token') || '',
    module: "shop",
    form: "BasketDoc",
    method: "getDraftBasketDoc"
  });
  if (response?.Error) {
    toast.add({
      severity: 'error', summary: response.Error, life: 3000
    });
    return;
  }
  console.log('response = ', response);

  const { id, Name, Price } = toRaw(data);
  const Entity: any = [...toRaw(response.Entity)];
  
 const inBasket = Entity.some(({ Material_id }: any) => Material_id == id);
  console.log('inBasket = ', inBasket);
  if (inBasket) {
    response.Entity.push({
      Quantity: response.Entity.Quantity + 1,
      Price,
      Summa: response.Entity.Summa + Price
    })
  }
  else {
    response.Entity.push({
      Material_id: id,
      Material_Name: Name,
      Quantity: '1',
      Price,
      Summa: Price,
      Parent: response.DocMovement.id
    })
  }
  //console.log('response.Entity = ', response.Entity);
  const responseSaveEntity: any = await post({
    Token: localStorage.getItem('Token') || '',
    module: "shop",
    form: "BasketEntityDoc",
    data: { DocMovement: response.Entity[0] }
  });
  if (responseSaveEntity?.Error) {
    toast.add({
      severity: 'error', summary: responseSaveEntity.Error, life: 3000
    });
    return;
  }
  alert(`Товар "${data.Name}" добавлен в корзину`);
}

</script>

<style>
@import 'primeicons/primeicons.css';
</style>