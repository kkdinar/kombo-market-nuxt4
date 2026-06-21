<template>
  <div>
    <div class="fixed">
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'informing', form: 'InformDocReestr' })" />
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="" />
        </template>
      </Toolbar>
    </div>
    <Toast position="center" />
    <div align="center">
      <label>Рассылка активна</label>
      <Checkbox id="Active" v-model="InformDocStore.DocData.DocMovement.Active" :binary="true" />
      <Divider />
      <label>Тема</label>
      <InputText id="Subject" v-model="InformDocStore.DocData.DocMovement.Subject" type="text" :class="classSubject" />
      <Divider />
      <label>Тип оповещения</label>
      <AutoComplete id="InformType" v-model="selectedInformType" :suggestions="filteredInformType" dropdown
        optionLabel="Name" forceSelection @complete="searchInformType($event)">
      </AutoComplete>
      <Divider />
      <div>
        <label>Текст</label>
        <Textarea id="Text" v-model="InformDocStore.DocData.DocMovement.Text" :autoResize="true" rows="5" cols="30" />
      </div>
      <label>Модуль:</label>
      <AutoComplete v-model="selectedModuleName" :suggestions="filteredModuleName" :dropdown="true" optionLabel="Name"
        forceSelection @complete="searchModuleName($event)" @clear="clearModule" @option-select="selectModule">
      </AutoComplete>
      <label>Форма:</label>
      <AutoComplete v-model="selectedFormName" :suggestions="filteredFormName" :dropdown="true" optionLabel="Name"
        forceSelection @complete="searchFormName($event)" @clear="clearForm">
      </AutoComplete>
      <Divider />
      <label>Описание</label>
      <Textarea id="description" v-model="InformDocStore.DocData.DocMovement.Description" :autoResize="true" rows="5"
        cols="30" />
      <Divider />
      <label>Периодичность отправки:</label>
      <AutoComplete v-model="selectedPeriod" :suggestions="filteredPeriod" :dropdown="true" optionLabel="Name"
        forceSelection @complete="searchPeriod($event)" @clear="clearPeriod">
      </AutoComplete>
      <Divider />
      <label>День недели</label>
      <AutoComplete v-model="selectedWeekDay" :suggestions="filteredWeekDay" :dropdown="true" optionLabel="Name"
        forceSelection @complete="searchWeekDay($event)" @clear="clearWeekDay">
      </AutoComplete>
      <Divider />
      <label>Время </label>
      <Calendar id="time" v-model="time" :showTime="true" :showIcon="true" />
      <Divider />
      <label>Способ отправки</label>
      <AutoComplete id="SendingMethod" v-model="selectedSendingMethod" :suggestions="filteredSendingMethod"
        :dropdown="true" optionLabel="Name" forceSelection @complete="searchSendingMethod($event)"
        @input="inputSendingMethod($event)" @clear="clearSendingMethod">
      </AutoComplete>
      <div v-if="showTelegramContacts">
        <label>Телеграм Контакты</label>
        <Checkbox v-model="telegramContacts" :binary="true" @input="changeTelegramContacts" />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
const Token = localStorage.getItem('Token') || '';
import { useToast } from 'primevue/usetoast';
const classSubject = (data: any) => {
  return [
    {
      'p-invalid': !InformDocStore.DocData.DocMovement.Subject
    }
  ];
};

const InformTypes: { Name: string; Type: string }[] = [
  { Name: 'Сообщение', Type: 'message' },
  { Name: 'Отчёт', Type: 'report' }
];
const sendingMethods: { Name: string }[] = [{ Name: 'Email' }, { Name: 'Telegram' }];
let showMessageText, showReportData, showTelegramContacts, telegramContacts: any, telegramUsers;
const modulesFormsArr: any = [];
const forms: any = [];
// Список модулей
let answer: any = await get({ Token });
const modulesArr: any = answer.Entity || [];
// Собираем формы по всем модулям
for await (const Module of modulesArr) {
  answer = await get({
    module: Module.module,
    Token
  });
  modulesFormsArr.push({
    module: Module.module,
    moduleName: Module.Name,
    formsArr: answer.Entity
  });
}

const toast = useToast();
const route = useRoute();

const InformDocStore = useDocHandlerStore('InformDoc');
await InformDocStore.mount({
  Token,
  module: 'informing',
  form: 'InformDoc',
  id: route.query.id as string
});

let view = 'PeriodView';
const PeriodStore: any = await post({
  Token,
  module: 'dictionary',
  form: 'PeriodDoc',
  method: "getView",
  data: { DocMovement: { view } }
});

if (PeriodStore.Error) {
  toast.add({
    severity: 'error', summary: PeriodStore.Error, life: 3000
  });
};
console.log('PeriodStore = ', toRaw(PeriodStore));


view = 'WeekDayView';
const WeekDayStore: any = await post({
  Token,
  module: 'dictionary',
  form: 'WeekDayDoc',
  method: "getView",
  data: { DocMovement: { view } }
});

if (WeekDayStore.Error) {
  toast.add({
    severity: 'error', summary: WeekDayStore.Error, life: 3000
  });
}

const telegramContactsResponse: any = await get({
  Token,
  module: 'telegram',
  form: 'TgUserDoc',
  id: 0
});

if (telegramContactsResponse.Error) {
  toast.add({
    severity: 'error', summary: telegramContactsResponse.Error, life: 3000
  });
};
console.log('telegramContactsResponse = ', toRaw(telegramContactsResponse));

const userResponse: any = await get({
  Token,
  module: 'dictionary',
  form: 'UserDoc',
  id: 0
});

if (userResponse.Error) {
  toast.add({
    severity: 'error', summary: userResponse.Error, life: 3000
  });
};
console.log('userResponse = ', toRaw(userResponse));


//Модуль
const filteredModuleName = ref();
const selectedModuleName = ref();
const searchModuleName = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredModuleName.value = [...toRaw(modulesArr)];
    } else {
      filteredModuleName.value = toRaw(modulesArr).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const clearModule = () => {
  selectedModuleName.value = null;
}

let formArr: any = [];
const selectModule = async (event: any) => {
  formArr = [];
  const moduleRow = modulesFormsArr.find((m: any) => m.module === event.value?.module);
  moduleRow.formsArr.forEach((row: any) => {
    // console.log('row=', row);
    if (!formArr.some((m: any) => m.form === row.form)) {
      formArr.push({ Name: row.Name, form: row.form });
    }
  });
}


//Форма
const filteredFormName = ref();
const selectedFormName = ref();
const searchFormName = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredFormName.value = [...toRaw(formArr)];
    } else {
      filteredFormName.value = toRaw(formArr).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}

const formName = InformDocStore.DocData.DocMovement.FormName;
selectedFormName.value = formArr.find((r: any) => r.Name == formName);

const clearForm = () => {
  selectedFormName.value = null;
}


//InformType
const filteredInformType = ref();
const selectedInformType = ref();
const searchInformType = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredInformType.value = [...toRaw(InformTypes)];
    } else {
      filteredInformType.value = toRaw(InformTypes).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const clearInformType = () => {
  selectedInformType.value = null;
}
const InformType = InformDocStore.DocData.DocMovement.InformType;
selectedInformType.value = InformTypes.find((r: any) => r.Name == InformType);

//SendingMethod
const filteredSendingMethod = ref();
const selectedSendingMethod = ref();
const searchSendingMethod = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredSendingMethod.value = [...toRaw(sendingMethods)];
    } else {
      filteredSendingMethod.value = toRaw(sendingMethods).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);

}
const clearSendingMethod = () => {
  selectedSendingMethod.value = null;
}
const sendingMethod = InformDocStore.DocData.DocMovement.SendingMethod;
selectedSendingMethod.value = sendingMethods.find((r: any) => r.Name == sendingMethod);

const inputSendingMethod = async ({ query = '' }) => {
  console.log('query = ', query);
  
  if (selectedSendingMethod.value === 'Telegram') {
    showTelegramContacts = 'true';
    if (InformDocStore.DocData.Entity.some((r: any) => r.DictionaryType === 'telegram.Contacts')) {
      telegramContacts = true;
    }
  }
  console.log('sendingMethod = ', sendingMethod);
  console.log('telegramContacts = ', telegramContacts);
  console.log('selectedSendingMethod.value = ', selectedSendingMethod.value);
}


const inputInformType = (selectedItem: any) => {
  console.log('event=', selectedItem);
  if (selectedItem.Type === 'message') {
    showMessageText = true;
    showReportData = false;
  } else if (selectedItem.Type === 'message') {
    showMessageText = false;
    showReportData = true;
  }
  // Сохраняем выбранный тип в хранилище
  InformDocStore.DocData.DocMovement.Type = selectedItem.Type;
}

//Дни недели
const selectedWeekDay = ref();
const filteredWeekDay = ref();
const searchWeekDay = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredWeekDay.value = [...toRaw(WeekDayStore.DocMovement.responseView)];
    } else {
      filteredWeekDay.value = toRaw(WeekDayStore.DocMovement.responseView).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const clearWeekDay = () => {
  selectedWeekDay.value = null;
}
console.log('WeekDayStore = ', toRaw(WeekDayStore.DocMovement.responseView));
console.log('filteredWeekDay = ', unref(filteredWeekDay.value));
console.log('[...toRaw(WeekDayStore.DocMovement.responseView)] = ', [...toRaw(WeekDayStore.DocMovement.responseView)]);

const weekDay = InformDocStore.DocData.DocMovement.WeekDay;
selectedWeekDay.value = WeekDayStore.DocMovement.responseView.find((r: any) => r.Name == weekDay);

//Период 
const selectedPeriod = ref();
const filteredPeriod = ref();
const searchPeriod = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredPeriod.value = [...toRaw(PeriodStore.DocMovement.responseView)];
    } else {
      filteredPeriod.value = toRaw(PeriodStore.DocMovement.responseView).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
console.log('PeriodStore = ', toRaw(PeriodStore.DocMovement.responseView));
console.log('filteredPeriod = ', toRaw(filteredPeriod));
const clearPeriod = () => {
  selectedPeriod.value = null;
}
const period = InformDocStore.DocData.DocMovement.Period;
selectedPeriod.value = PeriodStore.DocMovement.responseView.find((r: any) => r.Name == period);

const time = InformDocStore.DocData.DocMovement.Time;

//Telegram
const changeTelegramContacts = async ({ value = '' }) => {
  if (value) {
    telegramUsers = toRaw(telegramContactsResponse);
  }
  else {
    telegramUsers = toRaw(userResponse.Entity);
  }
}

onMounted(async () => {
  setToast(InformDocStore.DocData, toast);
  setWatch(InformDocStore.DocData, toast);
});
</script>