<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack" />
          <p>|</p>
          <Button label="Сохранить изменения цен" icon="pi pi-save" class="p-button-danger" @click="_save" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <label>Управление ценами</label>
      <DataTable :value="FilteredRows" showGridlines dataKey="id" size="small" editMode="cell" @cell-edit-complete="onCellEditComplete($event)">
        <template #header>
          <div class="flex justify-content-between">
            <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
            <label>|</label>
            <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredRows" />
            <label>|</label>
            <Button icon="pi pi-search" @click="filterFilteredRows" aria-label="Submit" />
          </div>
        </template>
        <Column field="Material_Name" header="Наименование товара" style="width: 30%">
          <template #body="{ data }">
            <Button :label="data.Material_Name" class="p-button-link"
              @click="downloadFileStorage({ id: data.FileStorage_id, Name: data.Name })" />
          </template>
        </Column>
        <Column field="Old_price" header="Старая цена" style="width: 35%" :editable="false">
          <template #body="{ data, field }">
            {{ data[field as string] }}
          </template>
          <template #editor="{ data, field }">
            <Text v-model="data[field]" />
          </template>
        </Column>
        <Column field="New_price" header="Новая цена" style="width: 34%" :editable="true">
          <template #body="{ data, field }">
            {{ data[field as string] }}
          </template>
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const FilteredRows: any = ref([]);
const FilterText = ref('');
const ProductCard: any = [];;


const fillEntity = async () => {
  const { Entity = [] }: any = await get({
    Token: localStorage.getItem('Token') || '',
    module: "shop",
    form: "ProductCardDoc",
    id: 0
  });
  if (Entity?.Error) {
    toast.add({
      severity: 'error', summary: Entity.Error, life: 3000
    });
  }

  for (const { id, Material_id, Material_Name, Price } of Entity) {
    ProductCard.push({id, Material_id, Material_Name, Old_price: Price, New_price: ''});
    FilteredRows.value.push({ id, Material_id, Material_Name, Old_price: Price, New_price: '' })
  }
}
fillEntity();


const clearFilters = () => {
  FilteredRows.value = ProductCard;
}

const filterFilteredRows = () => {
  FilteredRows.value = [];
  ProductCard.forEach((row: any) => {
    let { Material_Name } = row;
    Material_Name = Material_Name || '';
    console.log('Material_Name = ', Material_Name);
    if ((Material_Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      console.log('row = ', row);
      FilteredRows.value.push(row);
    }
  });
}

const onCellEditComplete = async (event: any) => {
  if (!validatePrice(event.newValue)) {
    toast.add({
      severity: 'error',
      summary: 'Некорректная цена',
      detail: 'Цена должна быть положительным числом',
      life: 3000
    });
    return;
  }
  let { data, newValue, field } = event;
  if (field.includes('_id')) { return; } // User_id
  data[field] = newValue;
}

const _save = async () => {
  for (const { id, Old_price, New_price } of unref(FilteredRows)) {
    if (New_price && Old_price.toString() !== New_price.toString()) {
      const { Entity = [] }: any = await post({
        Token: localStorage.getItem('Token') || '',
        module: "shop",
        form: "ProductCardDoc",
        data: { DocMovement: { id, Price: New_price} }
      });
      if (Entity?.Error) {
        toast.add({
          severity: 'error', summary: Entity.Error, life: 3000
        });
      }
    }
  }
  location.reload();
}

const validatePrice = (price: any): boolean => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0;
};

console.log('SaleDocsDoc', toRaw(FilteredRows));
</script>

<style>
@import 'primeicons/primeicons.css';

.p-datatable .p-editable-column .p-cell-editor input {
  background-color: #fff9c4;
  /* Светло-жёлтый фон */
  border: 1px solid #ffd54f;
}
</style>