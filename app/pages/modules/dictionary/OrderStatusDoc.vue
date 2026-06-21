<template>
  <div>
    <Toast />
    <Toolbar>
      <template #start>
        <Button label="Назад" icon="pi pi-chevron-left" @click="_clickBack" />
        <p>|</p>
        <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
        <p>|</p>
        <Button label="Создать" icon="pi pi-plus" class="p-button-success p-mr-2" @click="clickNew" />
        <p>|</p>
        <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
          :disabled="!OrderStatusStore.selectedRows || !OrderStatusStore.selectedRows.length" @click="clickDelete" />
      </template>
    </Toolbar>
    <div align="center">
      <h2>Справочник статусов заказов</h2>
      <p>Черновик - draft</p>
      <p>В работе/Оплачено - inwork</p>
      <p>Выезд - visit</p>
      <p>Выполнено - made</p>
      <br>
    </div>
    <DataTable :value="OrderStatusStore.DocData.Entity" showGridlines v-model:selection="OrderStatusStore.selectedRows"
      dataKey="id" editMode="cell" size="small" @cell-edit-complete="OrderStatusStore.onCellEditComplete($event)">
      <Column selectionMode="multiple" />
      <Column field="id" header="Код" :styles="{ width: '1%' }" />
      <Column header="Наименование" field="Name" style="width: 20%">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" />
        </template>
      </Column>
      <Column header="Тип" field="Type" style="width: 25%">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" />
        </template>
      </Column>
      <Column header="Описание" field="Description" style="width: 50%">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { clickBack, linkToForm } from '~/utils';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const Token = localStorage.getItem('Token');

import { useDocHandlerStore } from '~/stores';
const OrderStatusStore = useDocHandlerStore('OrderStatusDoc');
await OrderStatusStore.mount({
  module: 'dictionary',
  form: 'OrderStatusDoc',
  id: 0,
});

const clickSave = async () => {
  for (const row of toRaw(OrderStatusStore.DocData.Entity)) {
    const _row: any = row;
    if (_row.id < 0) { _row.id = null; }
    const formData: any = {
      Token,
      module: 'dictionary',
      form: 'OrderStatusDoc',
      data: { DocMovement: row }
    };
    console.log('formData=', formData);

    const { Error = null } = await post(formData);
    if (Error) {
      toast.add({ severity: 'error', summary: Error, life: 3000 });
    } else {
      toast.add({ severity: 'success', summary: 'Документ сохранён', life: 3000 });
    }
  }
}
const clickNew = async () => {
  if (!toRaw(OrderStatusStore.DocData.Entity).length) {
    const formData: any = {
      Token,
      module: 'dictionary',
      form: 'OrderStatusDoc',
      data: {
        DocMovement: {
          Name: 'Новая',
          form: 'OrderStatusDoc'
        }
      }
    };
    const answer: any = await post(formData);
    if (answer.Error) {
      toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
    } else {
      OrderStatusStore.DocData.Entity.push(answer.DocMovement);
    }
  } else {
    // Если id не из БД считаем в отрицательную сторону
    const entity: any = toRaw(OrderStatusStore.DocData.Entity)
    const newEntity: any = {};
    for (const key in entity[0]) {
      newEntity[key] = null;
    }
    const minID = Math.min(...entity.map((o: any) => o.id), 0);
    newEntity.id = minID > 0 ? -1 : minID - 1;
    newEntity.form = entity[0].form;
    newEntity.org = entity[0].org;
    OrderStatusStore.DocData.Entity.push(newEntity);
  }
}
const clickDelete = async () => {
  let selectedRows: any[] = toRaw(OrderStatusStore.selectedRows);
  if (selectedRows.some(r => r < 0)) {
    const newTable: any = [];
    toRaw(OrderStatusStore.DocData.Entity).forEach((row: any) => {
      if (selectedRows.some(({ id }) => id > 0)) {
        newTable.push(row);
      }
    });
    selectedRows = newTable;
  }
  for (const row of selectedRows) {
    const formData: any = {
      Token,
      module: 'dictionary',
      form: 'OrderStatusForm',
      data: { DocMovement: row }
    };
    const answer: any = await deleteRows(formData);
    if (answer.Error) {
      toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
    } else {
      const newTable: any = [];
      toRaw(OrderStatusStore.DocData.Entity).forEach((row: any) => {
        if (!toRaw(OrderStatusStore.selectedRows).some((r: any) => row.id === r.id)) { newTable.push(row); }
      });
      OrderStatusStore.DocData.Entity = newTable;
      OrderStatusStore.selectedRows = [];
    }
  }
}
const _clickBack = () => {
  return navigateTo('/modules/admin');
}
onMounted(async () => {
  setToast(OrderStatusStore.DocData, toast);
  setWatch(OrderStatusStore.DocData, toast);
});
</script>

<style>
@import 'primeicons/primeicons.css';
</style>