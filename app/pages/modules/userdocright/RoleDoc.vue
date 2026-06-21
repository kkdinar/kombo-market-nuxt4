<template>
  <div>
    <div>
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'userdocright', form: 'RoleReestr' })" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="_clickSave" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>
    <br>
    <div>
      <label><b>Название роли: </b></label>
      <InputText type="text" v-model="RoleDocStore.DocData.DocMovement.Name" />
      <p />
      <label> <b>Описание роли: </b></label>
      <Textarea id="Text" v-model="RoleDocStore.DocData.DocMovement.Description" rows="5" cols="100" />
    </div>
    <Divider />
    <div>
      <table>
        <tr>
          <td>
            <b>Модуль:</b>
          </td>
          <td>
            <AutoComplete v-model="selectedModule" :suggestions="filteredModule" :dropdown="true" optionLabel="Name"
              forceSelection @complete="searchModule($event)" @clear="clearModule" @option-select="selectModule">
            </AutoComplete>
          </td>
          <td>
            <b>Форма:</b>
          </td>
          <td>
            <AutoComplete v-model="selectedForm" :suggestions="filteredForm" :dropdown="true" optionLabel="Name"
              forceSelection @complete="searchForm($event)" @clear="clearForm">
            </AutoComplete>
          </td>
          <td>
            <Button label="Добавить" icon="pi pi-plus" class="p-button-success" @click="clickEntityAdd" />
          </td>
        </tr>
      </table>
    </div>
    <p />
    <Toolbar>
      <template #start>
        <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
          :disabled="!RoleDocStore.selectedRows || !RoleDocStore.selectedRows.length"
          @click="RoleDocStore.clickEntityDelete" />
      </template>
    </Toolbar>
    <DataTable :value="RoleDocStore.DocData.Entity" showGridlines v-model:selection="RoleDocStore.selectedRows"
      dataKey="id" editMode="cell" size="small" @cell-edit-complete="onCellEditComplete($event)">
      <Column selectionMode="multiple" style="width: 1%" />
      <Column field="id" header="Код" style="width: 1%" />
      <Column field="ModuleName" header="Модуль" style="width: 5%" />
      <Column field="_ModuleName" header="Модуль" style="width: 5%" />
      <Column field="FormName" header="Форма" style="width: 5%" />
      <Column field="_FormName" header="Форма" style="width: 5%" />
      <Column field="Write" header="Право на изменение" style="width: 15%">
        <template #editor="{ data, field }">
          <Checkbox id="binary" v-model="data[field]" :binary="true" />
        </template>
        <template #body="slotProps">
          <Checkbox id="binary1" v-model="slotProps.data.Write" :binary="true" />
        </template>
      </Column>
      <Column field="Name" header="Наименование">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { clickBack } from '~/utils';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores'
const toast = useToast();
const route = useRoute();
const RoleDocStore = useDocHandlerStore('RoleDoc');
await RoleDocStore.mount({
  module: 'userdocright',
  form: 'RoleDoc',
  id: route.query.id as string
});

const _clickSave = async () => {
  if (!RoleDocStore.DocData.DocMovement.Name) {
    toast.add({
      severity: 'error', summary: "Поле Название роли не заполнено", life: 3000
    });
    return;
  }
  RoleDocStore.clickSave();
}



const modulesFormsArr: any = [];
const getMenuItems = async () => {
  const UserAuthID = localStorage.getItem('UserAuthID') ?? '';
  const Token = localStorage.getItem('Token') || '';
  // Список модулей
  let answer: any = await get({ Token });
  //let answer: any = await get({ UserAuthID });
  const modulesArr: any = answer.Entity || [];
  // Собираем формы по всем модулям
  for await (const Module of modulesArr) {
    answer = await get({
      module: Module.module,
      Token
      //UserAuthID
    });
    modulesFormsArr.push({
      module: Module.module, //Модуль на англ
      moduleName: Module.Name, //Модуль на русском
      formsArr: answer.Entity // Массив всех форм модуля
    });
  }
}
await getMenuItems();
// console.log('modulesFormsArr=', modulesFormsArr);
const arr = toRaw(RoleDocStore.DocData.Entity);
arr.forEach((row: any) => {
  const moduleRow = modulesFormsArr.find((m: any) => m.module === row.ModuleName);
  const formRow = moduleRow.formsArr.find((m: any) => m.form === row.FormName);
  row._ModuleName = moduleRow.moduleName;
  // console.log('moduleRow=', moduleRow);
  if (formRow) {
    row._FormName = formRow.Name;
  }
});
RoleDocStore.DocData.Entity = arr;
let formArr: any = [];
const moduleArr: any = [];
modulesFormsArr.forEach((row: any) => {
  // console.log('row=', row);
  if (!moduleArr.some((m: any) => m.module == row.module)) {
    moduleArr.push({ Name: row.moduleName, module: row.module });
  }
});
const filteredModule = ref();
const selectedModule = ref();
const searchModule = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredModule.value = [...moduleArr];
    } else {
      filteredModule.value = moduleArr.filter(({ Name = '' }: any) => {
        return !!Name.toLowerCase().includes(query.toLowerCase());
      });
    }
  }, 250);
}
const clearModule = () => {
  selectedModule.value = null;
}
const selectModule = async (event: any) => {
  // console.log(event);
  formArr = [];
  clearForm();
  const moduleRow = modulesFormsArr.find((m: any) => m.module === event.value?.module);
  moduleRow.formsArr.forEach((row: any) => {
    if (!formArr.some((m: any) => m.form === row.form)) {
      formArr.push({ Name: row.Name, form: row.form });
    }
  });
}
const filteredForm = ref();
const selectedForm = ref();
const searchForm = async ({ query = '' }) => {
  // надо удалить то что уже есть в табличной части
  const filteredFormArr: any = [];
  // const filteredFormArr: any = formArr;
  //const allowedForms: any = {};
  formArr.forEach((row: any) => {
    const alreadyInTable = toRaw(RoleDocStore.DocData.Entity);  //Уже в таблице есть
    const _selectedModule = selectedModule.value.module; //Выбранный модуль
    const allForms = modulesFormsArr.find((m: any) => m.module === _selectedModule).formsArr; //Все формы выбранного модуля form

    if (alreadyInTable.length > 0) {
      //allowedForms.length = 0;
      const alreadyInTableThisModule = alreadyInTable.filter((item: any) => item.ModuleName === _selectedModule)
      console.log('alreadyInTableThisModule=', alreadyInTableThisModule);
      //objectArrayDifference(allForms, alreadyInTableThisModule, 'form', 'FormName');
      console.log('allowedForms=', objectArrayDifference(allForms, alreadyInTableThisModule, 'form', 'FormName'));
      setTimeout(() => {
        if (!query.trim().length) {
          filteredForm.value = [...objectArrayDifference(allForms, alreadyInTableThisModule, 'form', 'FormName')];
        } else {
          filteredForm.value = objectArrayDifference(allForms, alreadyInTableThisModule, 'form', 'FormName').filter(({ Name = '' }: any) => {
            return !!Name.toLowerCase().includes(query.toLowerCase());
          });
        }
      }, 250);
      // alreadyInTable.forEach((row: any) => { //Выборка
      //   const { ModuleName, FormName } = row;
      //   console.log('_selectedModule', _selectedModule);
      //   console.log('objectArrayDifference = ', objectArrayDifference(alreadyInTable, modulesFormsArr, 'FormName', 'form'));
      //    allForms.forEach((r: any) => { //Выборка
      //      console.log('ModuleName', ModuleName);
      //      console.log('_selectedModule', _selectedModule);
      //      console.log('r.form', r.form);
      //      console.log('FormName', FormName);
      //      console.log('!alreadyInTable.includes(r.form)', !alreadyInTable.includes(r.form));
      //      if (ModuleName == _selectedModule && FormName == r.form) {
      //        allowedForms.push(r)
      //      }
      //    })
      // })
      // 
    }
    if (alreadyInTable.length == 0) {
      //const formRow = moduleRow.formsArr.find((m: any) => m.form === row.FormName);
      if (!toRaw(RoleDocStore.DocData.Entity).some((m: any) => (m.form === row.form /*&& row.module === selectedModule.value.module*/))) {
        filteredFormArr.push(row);
      }
      console.log('filteredFormArr=', filteredFormArr);
      setTimeout(() => {
        if (!query.trim().length) {
          filteredForm.value = [...filteredFormArr];
        } else {
          filteredForm.value = filteredFormArr.filter(({ Name = '' }: any) => {
            return !!Name.toLowerCase().includes(query.toLowerCase());
          });
        }
      }, 250);
    }


  });
}
function objectArrayDifference(array1: any, array2: any, prop1: any, prop2: any) {
  return array1.filter((item1: any) => !array2.find((item2: any) => item1[prop1] === item2[prop2]))
}
const clearForm = () => {
  selectedForm.value = null;
}

const clickEntityAdd = () => {
  if (selectedForm.value.form) {
    RoleDocStore.DocData.Entity.push({
      ModuleName: selectedModule.value.module,
      FormName: selectedForm.value.form

    });
  }
}
const onCellEditComplete = (event: any) => {
  // console.log('event=', event);
  if (!event) { return; }
  let { data, newValue, field } = event;
  console.log('data, newValue, field', data, newValue, field)
  data[field] = newValue;
}
onMounted(async () => {
  await searchModule({ query: '' });
  setToast(RoleDocStore.DocData, toast);
});
</script>
<style>
@import 'primeicons/primeicons.css';
</style>