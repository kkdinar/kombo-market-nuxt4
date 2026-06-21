<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="main" />
          <!-- <p>|</p> -->
          <!-- <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" /> -->
        </template>
      </Toolbar>
    </div>
    <Toast />
    <h1 align="center">Избранное</h1>
    <p />
    <DataTable :value="FilteredFavorites" data-key="id" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-between">
          <Button type="button" icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined"
            @click="clearFilters" />
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredFavorites" />
          <Button icon="pi pi-search" @click="filterFilteredFavorites" />
        </div>
      </template>
      <Column field="Image" style="width: 20%">
        <template #body="{ data }">
          <Image :src="data.imageUrl" alt="Фото" style="width: 100%" @click="clickShowCard(data)"/>
        </template>
      </Column>
      <Column style="width: 80%">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <p />
            <Badge :value="data.Price"></Badge>
            <p />
            <Button :label="data.Name" class="p-button-link" @click="clickShowCard(data)" />
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
            <p />
            <Button label="Удалить из избранного" @click="clickDelFavorite(data)" />
          </div>
        </template>
      </Column>
    </DataTable>
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
const FilteredFavorites: any = ref([]);
const FilterText = ref('');
const FavoritesEntity: any = [];

const main = async () => { navigateTo('/'); }

const getFavorites = async () => {
  const { Entity = [] } = await post({
    Token,
    module: "shop",
    form: "FavoritesDoc",
    method: "getFavorites",
    data: { DocMovement: {} }
  });
  FavoritesEntity.push(...unref(Entity));
  FilteredFavorites.value = [];
  for (const { id, ProductCard_id, ServiceCard_id, Material_Name, Description, FileStorage_id, org, Price, Level = 0, inFavorit } of FavoritesEntity) {
    FilteredFavorites.value.push({ id, ProductCard_id, ServiceCard_id, Name: Material_Name, Description, Price, imageUrl: getImageUrl(FileStorage_id, org), Level: Number(Level), inFavorit })
  }
}
getFavorites();

const clearFilters = () => {
  FilterText.value = '';
  getFavorites();
}

const filterFilteredFavorites = () => {
  FilteredFavorites.value = [];
  FavoritesEntity.forEach((row: any) => {
    let { Name = '', Description = '', FileStorage_id, org } = row;
    Name = Name || '';
    Description = Description || '';
    row.imageUrl = getImageUrl(FileStorage_id, org)
    if ((Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredFavorites.value.push(row);
    } else if ((Description.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredFavorites.value.push(row);
    }
  });
}

const clickDelFavorite = async (data: any) => {
  const { id } = toRaw(data);
  //const ProductCard_id = id;
  const response: any = await deleteRows({
    Token: localStorage.getItem('Token') || '',
    module: "shop",
    form: "FavoritesDoc",
    data: {
      DocMovement: {
        id
      }
    }
  });
  if (response?.Error) {
    toast.add({
      severity: 'error', summary: response.Error, life: 3000
    });
    return;
  }
  else {
    FilteredFavorites.value = FilteredFavorites.value.filter((item: any) => item.id !== id);
  }
}

const clickShowCard = (data: any) =>{
  const { ProductCard_id, ServiceCard_id } = toRaw(data);
  if (ProductCard_id && !ServiceCard_id) {
    linkToForm({
              module: 'shop',
              form: 'ShowProductCard',
              id: ProductCard_id,
            })
  }
  else if(!ProductCard_id && ServiceCard_id){
    linkToForm({
              module: 'shop',
              form: 'ShowServiceCard',
              id: ServiceCard_id,
            })
  }
}
onMounted(async () => {
});
</script>

<style>
@import 'primeicons/primeicons.css';

.fixed {
  position: sticky;
  /*позицианируем чтобы исчез скролл*/
  width: 100%;
  /*что бы верстка не складывалась по ширине*/
  top: 0px;
  z-index: 99999999;

  /*поверх всех элементов*/
  .error {
    border-color: red;
  }

  .error-msg {
    color: red;
    font-size: 0.8em;
  }
}

.active {
  background-color: #adaf4c;
  /* Зелёный */
  color: white;
  border: 2px solid #89a045;
}
</style>