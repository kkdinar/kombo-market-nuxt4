<template>
  <div class="products-page">
    <div class="fixed">
      <Toast position="center" />
      <Toolbar>
        <template #center>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'shop', form: 'ProductCardReestr' })" />
          <p>|</p>
          <!-- <Button label="Создать Товар" icon="pi pi-plus" class="p-button-success" @click="clickNewMaterial" />
          <p>|</p> -->
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
          <p>|</p>
          <Button label="Как карточка будет выглядеть на витрине" icon="pi pi-eye" class="p-button-success"
            @click="previewProductCard" />
          <p>|</p>
          <Button label="Заполнить характеристики" icon="pi pi-list" class="p-button-success"
            @click="ProductCardParams" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <div>
        <p />
        <label>Карточка товара выставлена в каталоге: </label>
        <ToggleButton v-model="ProductCardDocStore.DocData.DocMovement.Active" :disabled = true onLabel="Да" offLabel="Нет" />
        <p />
        <label>Статус карточки: </label>
        <AutoComplete v-model="selectedStatus" :suggestions="filteredStatus" dropdown optionLabel="Name" forceSelection
          @complete="searchStatus($event)">
        </AutoComplete>
        <Divider />
        <!-- <label>Тип: </label>
        <AutoComplete v-model="selectedDictionaryType" :suggestions="filteredDictionaryType" dropdown optionLabel="Name"
          forceSelection @complete="searchDictionaryType($event)">
        </AutoComplete>
        <Divider /> -->
        <label>Товар: </label>
        <AutoComplete v-model="selectedMaterial_Name" :suggestions="filteredMaterial_Name" dropdown optionLabel="Name"
          forceSelection @complete="searchMaterial_Name($event)">
        </AutoComplete>
        <Divider />
        <label>Ед.измерения: </label>
        <AutoComplete v-model="selectedMeasure_Name" :suggestions="filteredMeasure_Name" dropdown optionLabel="Name"
          forceSelection @complete="searchMeasure_Name($event)">
        </AutoComplete>
        <Divider />
        <label>Стоимость: </label>
        <InputNumber id="Price" v-model="ProductCardDocStore.DocData.DocMovement.Price" mode="decimal"
          :minFractionDigits="2" />
        <label> рублей</label>
        <Divider />
        <label>Описание товара: </label>
        <p />
        <Textarea id="Description" v-model="ProductCardDocStore.DocData.DocMovement.Description" :autoResize="true"
          rows="10" cols="50" />
        <Divider />
        <p><b>Описание для ускорения поиска:</b></p>
        {{ ProductSpecificationList }}
        <p />
        <Button label="Добавить описание" icon="pi pi-sitemap" class="p-button-success"
          @click="clickMaterialSpecification" />
        <Divider />
        <FileUpload mode="basic" name="demo[]" :customUpload="true" :auto="true" :maxFileSize="10000000"
          chooseLabel="Выбрать главное фото товара" @uploader="myUploader" />
        <p>-</p>
        <Image :src="imageUrl" alt="Фото товара" width="30%" height="30%" />
      </div>
      <div>
        <br>
        <Toolbar>
          <template #start>
            <FileUpload mode="basic" name="demo[]" customUpload :maxFileSize="10000000"
              chooseLabel="Добавить дополнительные фото/видео/аудио" :auto="true" @uploader="myUploaderEntity" />
            <p>|</p>
            <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
              :disabled="!ProductCardDocStore.selectedRows || !ProductCardDocStore.selectedRows.length"
              @click="ProductCardDocStore.clickEntityDelete" />
            <p>|</p>
            <label>Добавьте детальное описание</label>
          </template>
        </Toolbar>
        <DataTable :value="ProductCardDocStore.DocData.Entity" showGridlines dataKey="id" editMode="cell" size="small"
          v-model:selection="ProductCardDocStore.selectedRows" @cell-edit-complete="onCellEditComplete($event)">
          <Column selectionMode="multiple" style="width: 1%" />
          <Column field="Name" header="Вложение" style="width: 30%">
            <template #body="{ data }">
              <Button :label="data.Name" class="p-button-link"
                @click="downloadFileStorage({ id: data.FileStorage_id, Name: data.Name })" />
            </template>
          </Column>
          <Column field="Description" header="Описание" style="width: 69%">
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
    <!-- <Dialog v-model:visible="visible" modal header="Создание нового Товара" :style="{ width: '50%' }">
      <div align="center">
        <label> <b>Наименование товара: </b></label>
        <InputText v-model="newMaterialName" :style="{ width: '100%' }" />
        <p />
        <label> <b>Описание товара: </b></label>
        <InputText v-model="newDescription" :style="{ width: '100%' }" />
      </div>
      <p />
      <div align="right">
        <Button type="button" label="Отмена" class="p-button-danger" severity="secondary"
          @click="visible = false"></Button>
        <label>|</label>
        <Button type="button" label="Создать" @click="createNewMaterial"></Button>
      </div>
    </Dialog> -->
  </div>
</template>

<script setup lang="ts">
const Token = localStorage.getItem('Token') || '';
import { InputText } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores'
import { clickBack } from '~/utils';
import { ToggleButton } from 'primevue';
import { ToggleSwitch } from 'primevue';

// const visible = ref(false);
// const newMaterialName = ref('');
// const newDescription = ref('');
const ProductSpecificationList = ref('');

const toast = useToast();
const route = useRoute();

const ProductCardDocStore = useDocHandlerStore('ProductCardDoc');
await ProductCardDocStore.mount({
  module: 'shop',
  form: 'ProductCardDoc',
  id: route.query.id as string
});

const MeasureResponse: any = await get({
  Token,
  module: 'dictionary',
  form: 'MeasureDoc',
  id: 0
});

if (MeasureResponse.Error) {
  toast.add({
    severity: 'error', summary: MeasureResponse.Error, life: 3000
  });
};

// const MaterialDocStore = useDocHandlerStore('MaterialDoc');
// const clickNewMaterial = async () => {
//   await MaterialDocStore.mount({
//     module: 'dictionary',
//     form: 'MaterialDoc',
//     id: 0
//   });
//   MaterialDocStore.selectedRows = [];
//   visible.value = true;
// }

const MaterialResponse: any = await get({
  Token,
  module: 'dictionary',
  form: 'MaterialDoc',
  id: 0
});

if (MaterialResponse.Error) {
  toast.add({
    severity: 'error', summary: MaterialResponse.Error, life: 3000
  });
};

const ProductSpecificationDocStore = useDocHandlerStore('ProductSpecificationDoc');

let selectedProductSpecification = toRaw(ProductSpecificationDocStore.selectedRows) || {};
const JsonData = toRaw(ProductCardDocStore.DocData.DocMovement.JsonData) || {};

if (Object.keys(selectedProductSpecification).length) {
  ProductCardDocStore.DocData.DocMovement.JsonData = selectedProductSpecification;
} else if (Object.keys(JsonData).length) {
  selectedProductSpecification = JsonData;
  ProductSpecificationDocStore.selectedRows = JsonData;
}
ProductSpecificationList.value = await getProductSpecificationList(selectedProductSpecification, toast, ProductCardDocStore.DocData.DocMovement.id) || '';

//'DictionaryType'
// const dictionaryTypeName: any = [{ Name: 'Еда', DictionaryType: 'food' }, { Name: 'Услуга', DictionaryType: 'service' }];
// const filteredDictionaryType = ref();
// const selectedDictionaryType = ref();
// const searchDictionaryType = async ({ query = '' }) => {
//   setTimeout(() => {
//     if (!query.trim().length) {
//       filteredDictionaryType.value = [...dictionaryTypeName];
//     } else {
//       filteredDictionaryType.value = dictionaryTypeName.filter(({ Name = '' }: any) => {
//         return !!Name?.toLowerCase().includes(query?.toLowerCase());
//       });
//     }
//   }, 250);
// }
// const dictionaryType_Name = ProductCardDocStore.DocData.DocMovement.DictionaryType;
// selectedDictionaryType.value = MaterialResponse.Entity.find((r: any) => r.Name == dictionaryType_Name);


//'Status'
const statusName: any = [{ Name: 'Черновик', Status: 'draft' }, { Name: 'Требуется проверка', Status: 'needCheck' }];
const filteredStatus = ref();
const selectedStatus = ref();
const searchStatus = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredStatus.value = [...statusName];
    } else {
      filteredStatus.value = statusName.filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}

const setInitialStatus = () => {
  const status = ProductCardDocStore.DocData.DocMovement.Status;
  const statusArr = [];
  statusArr.push(...statusName, { Name: 'Проверено', Status: 'verified' });
  const foundStatus = statusArr.find((r: any) => r.Name === status);
  if (foundStatus) {
    selectedStatus.value = foundStatus;
  }
  if (!status || !selectedStatus.value) {
    selectedStatus.value = { Name: 'Черновик', Status: 'draft' };
    return;
  }
}

setInitialStatus();

//'Material_Name'
const filteredMaterial_Name = ref();
const selectedMaterial_Name = ref();
const searchMaterial_Name = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredMaterial_Name.value = [...toRaw(MaterialResponse.Entity)];
    } else {
      filteredMaterial_Name.value = toRaw(MaterialResponse.Entity).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const Material_Name = ProductCardDocStore.DocData.DocMovement.Material_Name;
selectedMaterial_Name.value = MaterialResponse.Entity.find((r: any) => r.Name == Material_Name);

//'Measure_Name'
const filteredMeasure_Name = ref();
const selectedMeasure_Name = ref();
const searchMeasure_Name = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredMeasure_Name.value = [...toRaw(MeasureResponse.Entity)];
    } else {
      filteredMeasure_Name.value = toRaw(MeasureResponse.Entity).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const Measure_Name = ProductCardDocStore.DocData.DocMovement.Measure_Name;
selectedMeasure_Name.value = MeasureResponse.Entity.find((r: any) => r.Name == Measure_Name);

const clickSave = async () => {
  if (!selectedMaterial_Name.value) {
    toast.add({
      severity: 'error', summary: "Поле 'Товар' не заполнено", life: 3000
    });
    return;
  }
  if (!selectedMeasure_Name.value) {
    toast.add({
      severity: 'error', summary: "Поле 'Ед.измерения' не заполнено", life: 3000
    });
    return;
  }
  ProductCardDocStore.DocData.DocMovement.id = route.query.id;
  ProductCardDocStore.DocData.DocMovement.Measure_Name = selectedMeasure_Name.value.Name;
  ProductCardDocStore.DocData.DocMovement.Measure_id = selectedMeasure_Name.value.id;
  ProductCardDocStore.DocData.DocMovement.Material_Name = selectedMaterial_Name.value.Name;
  ProductCardDocStore.DocData.DocMovement.Material_id = selectedMaterial_Name.value.id;
  ProductCardDocStore.DocData.DocMovement.Status = selectedStatus.value.Status;
  ProductCardDocStore.DocData.DocMovement.DictionaryType = 'food';
  if (Object.keys(selectedProductSpecification).length) {
    ProductCardDocStore.DocData.DocMovement.JsonData = selectedProductSpecification;
  }
  await ProductCardDocStore.clickSave();
}

// const createNewMaterial = async (event: any) => {
//   //Записать в материалДок и продукткарддок    
//   const materialOrg = ProductCardDocStore.DocData.DocMovement.org ? ProductCardDocStore.DocData.DocMovement.org : null;
//   const MaterialResponse: any = await post({
//     Token,
//     module: 'dictionary',
//     form: 'MaterialDoc',
//     data: {
//       DocMovement: {
//         Name: newMaterialName.value,
//         Description: newDescription.value,
//         org: materialOrg
//       }
//     }
//   });

//   if (MaterialResponse.Error) {
//     toast.add({
//       severity: 'error', summary: MaterialResponse.Error, life: 3000
//     });
//   }
//   else {
//     if (MaterialResponse.Message) {
//       toast.add({
//         severity: 'message', summary: ('Товар сохранён'), life: 3000
//       });
//     }
//     const { id, Name } = MaterialResponse.DocMovement;
//     // ProductCardDocStore.DocData.DocMovement.Material_id = id;
//     // ProductCardDocStore.DocData.DocMovement.Material_Name = Name;
//   }
//   console.log('MaterialResponse = ', toRaw(MaterialResponse));
//   //selected и запушить в Энтити
// }

const myUploader = async (event: any) => {
  const fileName = event.files[0].name;
  // console.log('fileName = ', fileName);
  const entityRow = await uploadFileStorage(event, {
    module: 'shop',
    form: 'ProductCardDoc',
    data: {
      DocMovement: {
        id: route.query.id,
        Text: fileName,
        Date: new Date()
      }
    }
  }, toast);
  if (entityRow.DocData) {
    ProductCardDocStore.DocData.DocMovement.FileStorage_id = entityRow.DocData.FileStorage_id;
  }
}

const imageUrl = ref();
const { FileStorage_id, org } = ProductCardDocStore.DocData.DocMovement;
imageUrl.value = getImageUrl(FileStorage_id, org)

const myUploaderEntity = async (event: any) => {
  const fileName = event.files[0].name;
  // console.log('fileName = ', fileName);
  const entityRow = await uploadFileStorage(event, {
    module: 'shop',
    form: 'ProductCardEntityDoc',
    data: {
      DocMovement: {
        Parent: route.query.id,
        Name: fileName
      }
    }
  }, toast);
  if (entityRow.DocData) {
    // console.log('entityRow = ', entityRow);
    entityRow.DocData.Type = entityRow.FullFileStorageData.Type;
    ProductCardDocStore.DocData.Entity.push(entityRow.DocData);
  }
}

const onCellEditComplete = (event: any) => {
  // console.log('event=', event);
  if (!event) { return; }
  let { data, newValue, field } = event;
  console.log('data, newValue, field', data, newValue, field)
  data[field] = newValue;
}

const clickMaterialSpecification = () => {
  // const backUrl = '/modules/travel/ProductCardDoc?id=' + route.query.id;
  return navigateTo('/modules/shop/ProductSpecification');
}

const previewProductCard = () => {
  const url = '/modules/shop/PreviewProductCard?id=' + route.query.id;
  return navigateTo(url);
}

const ProductCardParams = () => {
  const url = '/modules/shop/ProductCardParamsDoc?id=' + route.query.id;
  return navigateTo(url);
}

onMounted(async () => {
  setToast(ProductCardDocStore.DocData, toast);
  setWatch(ProductCardDocStore.DocData, toast);
});
</script>
