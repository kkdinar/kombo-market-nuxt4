<template>
  <div>
    <Toast />
    <Toolbar>
      <template #start>
        <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'shop' })" />
        <p>|</p>
        <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
      </template>
    </Toolbar>
    <PickList v-model="itemsEntity" list-style="height:342px" data-key="id">
      <template #sourceheader>
        Доступно
      </template>
      <template #targetheader>
        Выбрано
      </template>
      <template #option="{ option, selected }">
        <div class="product-item">
          <div class="product-list-detail">
            <h5 class="mb-2">
              {{ option.Name }}
            </h5>
          </div>
        </div>
      </template>
    </PickList>
  </div>
</template>

<script setup lang="ts">
import { clickBack } from '~/utils';
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { useDocHandlerStore } from '~/stores'

const itemsEntity: any = ref([[], []]);
const Token = localStorage.getItem('Token') || '';

const MainWindowFormListStore = useDocHandlerStore('MainWindowFormList');
await MainWindowFormListStore.mount({
  module: 'sitesetting',
  form: 'MainWindowFormList',
  id: 0
});

const updateMenuItems = async (Entity = []) => {
  const items: any = [];
  const selection: any = [];
  let id = 0;
  // Список модулей
  let answer: any = await get({ Token });
  if (answer.Error === 'Token is expired') { return navigateTo('/auth'); }
  const modulesArr: any = answer.Entity || [];
  // Собираем формы по всем модулям
  for await (const { module, Name } of modulesArr) {
    const config = {
      module,
      Token
    };
    answer = await get(config);
    if (answer.Error === 'Token is expired') { return navigateTo('/auth'); }
    answer.Entity.forEach((Form: any) => {
      if (Form.DisplayForm) {
        id = id + 1;
        const haveDoc = Entity.some(({ ModuleName, FormName }) => ModuleName === module && FormName === Form.form);
        if (haveDoc) {
          selection.push({
            id,
            ModuleName: module,
            FormName: Form.form,
            Name: Name + ' | ' + Form.Name
          });
        } else {
          items.push({
            id,
            ModuleName: module,
            FormName: Form.form,
            Name: Name + ' | ' + Form.Name
          });
        }
      }
    });
  }
  console.log(selection);
  return [items, selection];
}

itemsEntity.value = await updateMenuItems(toRaw(MainWindowFormListStore.DocData.Entity) as any) || [[], []];

const clickSave = async () => {
  const formData = {
    module: 'sitesetting',
    form: 'MainWindowFormList',
    Token,
    data: { Entity: toRaw(itemsEntity.value[1]) || [] }
  };
  const { Error = null } = await post(formData);
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
  } else {
    toast.add({ severity: 'success', summary: 'Документ сохранён', life: 3000 });
  }
}
onMounted(async () => {
  setToast(MainWindowFormListStore.DocData, toast);
  setWatch(MainWindowFormListStore.DocData, toast);
});
</script>

<style>
@import 'primeicons/primeicons.css';

product-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  width: 100%;

  .product-list-detail {
    flex: 1 1 0;
  }
}

@media screen and (max-width: 576px) {
  .product-item {
    flex-wrap: wrap;
  }
}
</style>