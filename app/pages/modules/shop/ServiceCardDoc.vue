<template>
  <div class="products-page">
    <div class="fixed">
      <Toast position="center" />
      <Toolbar>
        <template #center>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'shop', form: 'ServiceCardReestr' })" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave"
            :disabled="allDisabled" />
          <p>|</p>
          <Button label="Как карточка будет выглядеть в каталоге" icon="pi pi-eye" class="p-button-success"
            @click="previewServiceCard" />
          <p>|</p>
          <Button label="Заполнить характеристики" icon="pi pi-list" class="p-button-success" @click="ServiceCardParams"
            :disabled="allDisabled" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <div>
        <p />
        <label>Карточка выставлена в каталоге: </label>
        <ToggleButton v-model="ServiceCardDocStore.DocData.DocMovement.Active" :disabled=true onLabel="Да"
          offLabel="Нет" />
        <p />
        <label>Статус карточки: </label>
        <b>{{ CardStatus.Name }} </b>
        |
        <Button v-if="CardStatus.Status === 'draft'" label="Разместить карточку в каталоге" icon="pi pi-check"
          class="p-button-success" @click="postServiceCard" />
        <Button v-if="CardStatus.Status === 'needCheck' || CardStatus.Status === 'verified'"
          label="Убрать карточку из каталога" icon="pi pi-ban" class="p-button-success" @click="delServiceCard" />
        <Divider />
        <label>Выберите наименование услуги: </label>
        <AutoComplete v-model="selectedMaterial_Name" :suggestions="filteredMaterial_Name" dropdown optionLabel="Name"
          forceSelection @complete="searchMaterial_Name($event)">
        </AutoComplete>
        |
        <Button label="Нет нужного мне наименования услуги" icon="pi pi-hammer" class="p-button-success"
          @click="notHaveMaterialName" />
        <Divider />
        <!-- <label>Ед.измерения: </label>
        <AutoComplete v-model="selectedMeasure_Name" :suggestions="filteredMeasure_Name" dropdown optionLabel="Name"
          forceSelection @complete="searchMeasure_Name($event)">
        </AutoComplete>
        |
        <Button label="Нет нужной мне единицы измерения" icon="pi pi-hammer" class="p-button-success"
          @click="notHaveMeasureName" />
        <Divider /> -->
        <label>Стоимость: </label>
        <InputNumber id="Price" v-model="ServiceCardDocStore.DocData.DocMovement.Price" mode="decimal"
          :minFractionDigits="2" />
        <label> рублей</label>
        <Divider />
        <label>Описание товара: </label>
        <p />
        <Textarea id="Description" v-model="ServiceCardDocStore.DocData.DocMovement.Description" :autoResize="true"
          rows="10" cols="50" />
        <Divider />
        <p><b>Описание для ускорения поиска:</b></p>
        {{ ServiceSpecificationList }}
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
              :disabled="!ServiceCardDocStore.selectedRows || !ServiceCardDocStore.selectedRows.length"
              @click="ServiceCardDocStore.clickEntityDelete" />
            <p>|</p>
            <label>Добавьте детальное описание</label>
          </template>
        </Toolbar>
        <DataTable :value="ServiceCardDocStore.DocData.Entity" showGridlines dataKey="id" editMode="cell" size="small"
          v-model:selection="ServiceCardDocStore.selectedRows" @cell-edit-complete="onCellEditComplete($event)">
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
    <Dialog v-model:visible="visibleRequest" modal header="Создание заявки" :style="{ width: '20%' }">
      <div align="center">
        <label> <b>Новое наименование: </b></label>
        <InputText v-model="newName" :style="{ width: '100%' }" />
        <!-- <p />
        <label> <b>Описание: </b></label>
        <InputText v-model="newDescription" :style="{ width: '100%' }" /> -->
      </div>
      <p />
      <div align="right">
        <Button type="button" label="Отмена" class="p-button-danger" severity="secondary"
          @click="visibleRequest = false"></Button>
        <label>|</label>
        <Button type="button" label="Отправить заявку" @click="createNewRequest"></Button>
      </div>
    </Dialog>

    <Dialog v-model:visible="visible" modal header="Заявка успешно создана" :style="{ width: '20%' }">
      <div align="center">
        <p>Номер заявки: {{ newRequestId }}</p>
      </div>
    </Dialog>
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
const newName = ref('');
const newDescription = ref('');
const visible = ref(false);
const newRequestId = ref('');

const allDisabled = ref(false);

const visibleRequest = ref(false);
const ServiceSpecificationList = ref('');

const toast = useToast();
const route = useRoute();

const ServiceCardDocStore = useDocHandlerStore('ServiceCardDoc');
await ServiceCardDocStore.mount({
  module: 'shop',
  form: 'ServiceCardDoc',
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

const ServiceSpecificationDocStore = useDocHandlerStore('ServiceSpecificationDoc');

let selectedServiceSpecification = toRaw(ServiceSpecificationDocStore.selectedRows) || {};
const JsonData = toRaw(ServiceCardDocStore.DocData.DocMovement.JsonData) || {};

if (Object.keys(selectedServiceSpecification).length) {
  ServiceCardDocStore.DocData.DocMovement.JsonData = selectedServiceSpecification;
} else if (Object.keys(JsonData).length) {
  selectedServiceSpecification = JsonData;
  ServiceSpecificationDocStore.selectedRows = JsonData;
}
ServiceSpecificationList.value = await getProductSpecificationList(selectedServiceSpecification, toast, ServiceCardDocStore.DocData.DocMovement.id) || '';

//'Status'
const statusArr: any = [
  { Name: 'Черновик', Status: 'draft' },
  { Name: 'На проверке', Status: 'needCheck' },
  { Name: 'Проверено', Status: 'verified' },
];
const CardStatus = ref();
const setInitialStatus = () => {
  const status = ServiceCardDocStore.DocData.DocMovement.Status;
  const foundStatus = statusArr.find((r: any) => r.Status === status);
  console.log('!!!foundStatus=', foundStatus);

  if (foundStatus) {
    CardStatus.value = foundStatus;
  }
  if (!status || !foundStatus) {
    CardStatus.value = { Name: 'Черновик', Status: 'draft' };
    return;
  }
  if (foundStatus.Status === 'needCheck') { //Если карточка на проверке - изменения запрещены
    allDisabled.value = true;
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
const Material_Name = ServiceCardDocStore.DocData.DocMovement.Material_Name;
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
const Measure_Name = ServiceCardDocStore.DocData.DocMovement.Measure_Name;
selectedMeasure_Name.value = MeasureResponse.Entity.find((r: any) => r.Name == Measure_Name);

const checkFields = () => {
  let summary = '';
  if (!selectedMaterial_Name.value) summary = "Поле 'Товар' не заполнено";
  if (!selectedMeasure_Name.value) summary = "Поле 'Ед.измерения' не заполнено";

  if (summary !== '') {
    toast.add({ severity: 'error', summary, life: 3000 });
    return false;
  }
  return true;
}

const clickSave = async () => {
  if (!checkFields()) return;
  ServiceCardDocStore.DocData.DocMovement.id = route.query.id;
  ServiceCardDocStore.DocData.DocMovement.Measure_Name = selectedMeasure_Name.value.Name;
  ServiceCardDocStore.DocData.DocMovement.Measure_id = selectedMeasure_Name.value.id;
  ServiceCardDocStore.DocData.DocMovement.Material_Name = selectedMaterial_Name.value.Name;
  ServiceCardDocStore.DocData.DocMovement.Material_id = selectedMaterial_Name.value.id;
  ServiceCardDocStore.DocData.DocMovement.Status = CardStatus.value.Status;
  ServiceCardDocStore.DocData.DocMovement.DictionaryType = 'food';
  if (Object.keys(selectedServiceSpecification).length) {
    ServiceCardDocStore.DocData.DocMovement.JsonData = selectedServiceSpecification;
  }
  await ServiceCardDocStore.clickSave();
}

const myUploader = async (event: any) => {
  const fileName = event.files[0].name;
  // console.log('fileName = ', fileName);
  const entityRow = await uploadFileStorage(event, {
    module: 'shop',
    form: 'ServiceCardDoc',
    data: {
      DocMovement: {
        id: route.query.id,
        Text: fileName,
        Date: new Date()
      }
    }
  }, toast);
  if (entityRow.DocData) {
    ServiceCardDocStore.DocData.DocMovement.FileStorage_id = entityRow.DocData.FileStorage_id;
  }
}

const imageUrl = ref();
const { FileStorage_id, org } = ServiceCardDocStore.DocData.DocMovement;
imageUrl.value = getImageUrl(FileStorage_id, org)

const myUploaderEntity = async (event: any) => {
  const fileName = event.files[0].name;
  // console.log('fileName = ', fileName);
  const entityRow = await uploadFileStorage(event, {
    module: 'shop',
    form: 'ServiceCardEntityDoc',
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
    ServiceCardDocStore.DocData.Entity.push(entityRow.DocData);
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
  return navigateTo('/modules/shop/ServiceSpecification');
}

const previewServiceCard = () => {
  const url = '/modules/shop/PreviewServiceCard?id=' + route.query.id;
  return navigateTo(url);
}

const ServiceCardParams = () => {
  const url = '/modules/shop/ServiceCardParamsDoc?id=' + route.query.id;
  return navigateTo(url);
}

onMounted(async () => {
  setToast(ServiceCardDocStore.DocData, toast);
  setWatch(ServiceCardDocStore.DocData, toast);
});

const postServiceCard = async () => {
  if (!checkFields()) return;
  CardStatus.value = { Name: 'На проверке', Status: 'needCheck' };
  await clickSave();
  window.location.reload();
}
const delServiceCard = async () => {
  CardStatus.value = { Name: 'Черновик', Status: 'draft' };
  await clickSave();
  window.location.reload();
}

let typeRequest = ref('');
const notHaveMaterialName = () => {
  visibleRequest.value = true;
  typeRequest.value = 'new_Service';
}
// const notHaveMeasureName = () => {
//   visibleRequest.value = true;
//   typeRequest.value = 'new_Measure';
// }
const createNewRequest = async () => {
  if (!toRaw(newName.value)) {
    toast.add({ severity: 'error', summary: 'Пожалуйста заполните поле "Новое наименование"', life: 3000 });
    return;
  }
  const responseRequest: any = await post({
    module: 'request',
    form: 'RequestDoc',
    data: { DocMovement: { Name: newName.value, Date: new Date(), Description: newDescription.value, Type: typeRequest.value, Active: 'true' } },
    Token, 
    method: 'requestFromClient'
  });
  //window.location.reload();
  visibleRequest.value = false;
  newRequestId.value = responseRequest.DocData.DocMovement.id;
  visible.value = true;
}

</script>