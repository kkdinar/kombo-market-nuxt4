<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <!-- <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'message', form: 'MessengerReestr' })" /> -->
          <Button label="Назад" icon="pi pi-chevron-left" @click="_clickBack" />
          <label>|</label>
          <FileUpload mode="basic" name="demo[]" customUpload :maxFileSize="100000000" chooseLabel="Файл" :auto="true"
            @uploader="myUploader" />
        </template>
        <template #center>
          {{ MessengerReestrStore.DocData.DocMovement?.Name }}
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />

    <DataTable :value="FilteredRows" v-model:selection="selectedRows" dataKey="id" size="small" scrollable
      scrollHeight="600px">
      <template #header>
        <div class="flex justify-content-between">
          <Button icon="pi pi-filter-slash" label="Очистить" class="p-button-outlined" @click="clearFilters" />
          <label>|</label>
          <InputText v-model="FilterText" placeholder="Поиск ..." @keydown.enter="filterFilteredRows" />
          <label>|</label>
          <Button icon="pi pi-search" label="Отфильтровать по тексту" @click="filterFilteredRows" aria-label="Submit" />
          <label>|</label>
          <DatePicker v-model="dateFilters" selectionMode="range" :manualInput="false" showClear showIcon />
          <label>|</label>
          <Button icon="pi pi-search" label="Отфильтровать по дате" @click="filterByDate" />
        </div>
      </template>
      <!-- <Column selectionMode="multiple" style="width: 1%" /> -->
      <Column field="User_Name" style="width: 10%" />
      <Column field="Date" style="width: 10%">
        <template #body="{ data }">
          <div :class="columnClass(data)">
            {{ formatDateTime(data.Date) }}
          </div>
        </template>
      </Column>
      <Column field="Status" style="width: 10%">
        <template #body="{ data }">
          <div :class="columnClass(data)">
            {{ data.Status }}
          </div>
        </template>
      </Column>
      <Column field="Text">
        <template #body="{ data }">
          <Button :label="data.Text" class="p-button-link" @click="_downloadFileStorage({
            id: data.FileStorage_id,
            Name: data.Text
          })" :disabled="!data.FileStorage_id" />
        </template>
      </Column>
    </DataTable>


    <InputText v-model="addText" placeholder="Введите текст ..." @keydown.enter="handleNewText" style="width: 89%" />
    <label>|</label>
    <Button icon="pi pi-send" @click="handleNewText" style="width: 10%" />
  </div>
</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
const router = useRouter();

const FilteredRows: any = ref();
const selectedRows: any = ref([]);
const FilterText = ref('');
const addText = ref('');
const dateFilters: any = ref([]);

let Status = 'sent';

let MessengerReestrStore: any = { DocData: { DocMovement: {}, Entity: [] } };

const getMessageByDate = async (DateBegin = new Date(), DateEnd = new Date()) => {
  console.log('DateBegin, DateEnd=', DateBegin, DateEnd);

  let body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'message',
    form: 'MessengerDoc',
    method: 'getMessengerDocByDate',
    data: {
      DocMovement: {
        Parent: route.query.id,
        DateBegin,
        DateEnd
      }
    }
  }
  let answer = await post(body);
  if (answer.Error) {
    console.log('Error=', answer.Error);
    toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
  } else {
    MessengerReestrStore.DocData = answer;
    const SendingMethod = (answer?.DocMovement as any).SendingMethod ?? 'amessenger';
    if (SendingMethod !== 'amessenger') {
      Status = 'wait_sent';
    }
    //Помечаем прочитанными в логах
    body = {
      Token: localStorage.getItem('Token') || '',
      module: 'message',
      form: 'MessengerDoc',
      method: 'setLogs',
      data: { Entity: answer.Entity }
    }
    answer = await post(body);
    if (answer.Error) {
      console.log('Error=', answer.Error);
      toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
    }
  }
}
await getMessageByDate();
dateFilters.value = [new Date(), new Date()];

const filterByDate = async () => {
  const [DateBegin, DateEnd] = dateFilters.value;
  await getMessageByDate(DateBegin, DateEnd);
  FilteredRows.value = toRaw(MessengerReestrStore.DocData.Entity);
}

FilteredRows.value = toRaw(MessengerReestrStore.DocData.Entity);

const filterFilteredRows = () => {
  FilteredRows.value = [];
  unref(MessengerReestrStore.DocData.Entity).forEach((row: any) => {
    let { User_Name = '', Text = '' } = row;
    User_Name = User_Name || '';
    Text = Text || '';
    if ((User_Name.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    } else if ((Text.toLowerCase()).includes(unref(FilterText).toLowerCase())) {
      FilteredRows.value.push(row);
    }
  });
}
const clearFilters = () => {
  // FilteredRows.value = unref(MessengerReestrStore.DocData.Entity);
  FilteredRows.value = toRaw(MessengerReestrStore.DocData.Entity);
}
const handleNewText = async () => {
  if (!addText.value) {
    return;
  }

  const body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'message',
    form: 'MessengerDoc',
    data: {
      DocMovement: {
        Parent: route.query.id,
        Text: addText.value,
        Date: new Date(),
        Status
      }
    }
  }
  const answer = await post(body);
  if (answer.Error) {
    MessengerReestrStore.DocData.Error = answer.Error;
    console.log('Error=', answer.Error);
  } else {
    // const [DateBegin, DateEnd] = dateFilters.value;
    // await getMessageByDate(DateBegin, DateEnd);
    // MessengerReestrStore.DocData.Entity.push(answer.DocMovement || {});
    // FilteredRows.value.push(answer.DocMovement || {});
    // FilteredRows.value = unref(MessengerReestrStore.DocData.Entity);
    // FilteredRows.value = toRaw(MessengerReestrStore.DocData.Entity);
    // console.log('FilteredRows.value=', FilteredRows.value);
    window.location.reload();
  }
  addText.value = '';
}

const columnClass = (data: any) => {
  return [
    {
      sent: data.Status === 'sent',
      delivered: data.Status === 'delivered',
      wait_sent: data.Status === 'wait_sent'
    }
  ];
}
const myUploader = async (event: any) => {
  const fileName = event.files[0].name;
  console.log('fileName = ', fileName);
  const entityRow = await uploadFileStorage(event, {
    module: 'message',
    form: 'MessengerDoc',
    data: {
      DocMovement: {
        Parent: route.query.id,
        Text: fileName,
        Date: new Date(),
        Status
      }
    }
  }, toast);
  console.log(entityRow);
  if (entityRow.Error) {
    toast.add({
      severity: 'error', summary: entityRow.Error, life: 3000
    });
  }
  if (entityRow.DocData) {
    MessengerReestrStore.DocData.Entity.push(entityRow.DocData || {});
    FilteredRows.value = unref(MessengerReestrStore.DocData.Entity);
  }
}

const _downloadFileStorage = async ({ id, Name }: any) => {
  await downloadFileStorage({ id, Name });
}

const _clickBack = () => {
  router.back();
}

onMounted(async () => {
  setToast(MessengerReestrStore.DocData, toast);
  setWatch(MessengerReestrStore.DocData, toast);
  const primevue = usePrimeVue();
  primevue.config.locale = localeRu as any;
});
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

.delivered {
  color: #66BB6A;
}

.sent {
  color: #FFA726;
}

.wait_sent {
  color: #db1010;
}
</style>