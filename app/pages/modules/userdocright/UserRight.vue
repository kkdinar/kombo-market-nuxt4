<template>
  <div>
    <div>
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left"
            @click="clickBack({ module: 'userdocright', form: 'UserRightReestr' })" />
          <p>|</p>
          <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>
    <br>
    <div>
      <label> <b>Пользователь: </b></label>
      <AutoComplete v-model="selectedUser" :suggestions="filteredUser" :dropdown="true" optionLabel="Login"
        forceSelection @complete="searchUser($event)" @clear="clearUser()"
        :disabled="!!UserDocStore.Entity.values.length" @change="userChange">
      </AutoComplete>
      <p />
      <label><b>ФИО пользователя: </b> {{ UserRightStore.DocData.DocMovement.User_Name }}</label>
      <!-- <InputText type="text" v-model="UserRightStore.DocData.DocMovement.Name" /> -->
      <p />
      <label> <b>Описание: </b> {{ UserRightStore.DocData.DocMovement.Description }}</label>
      <!-- <InputText type="text" v-model="UserRightStore.DocData.DocMovement.Description" /> -->


    </div>
    <Divider />
    <div>
      <td>
        <b>Роли:</b>
      </td>
      <td>
        <AutoComplete v-model="selectedRole" :suggestions="filteredRole" :dropdown="true" optionLabel="Name"
          forceSelection @complete="searchRole($event)" @clear="clearRole()"
          :disabled="!!RoleDocStore.Entity.values.length">
        </AutoComplete>
      </td>
    </div>
    <div>
      <p />
      <Toolbar>
        <template #start>
          <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
            :disabled="!UserRolesStore.selectedRows || !UserRolesStore.selectedRows.length"
            @click="clickDelete({ module: 'userdocright', form: 'UserRolesForm', selectedRows: UserRolesStore.selectedRows })" />
          <Button label="Добавить" icon="pi pi-plus" class="p-button-success" @click="clickEntityAddRole" />
        </template>
      </Toolbar>
      <DataTable :value="UserRolesStore.DocData.Entity" showGridlines v-model:selection="UserRolesStore.selectedRows"
        dataKey="id" editMode="cell" size="small" @cell-edit-complete="onCellEditComplete($event)">
        <Column selectionMode="multiple" style="width: 1%" />
        <Column field="id" header="Код строки" style="width: 1%" />
        <Column field="Role_id" header="Код роли" style="width: 3%">
          <template #editor="{ data, field }">
            <Checkbox id="binary" v-model="data[field]" :binary="true" />
          </template>
        </Column>
        <Column field="Role_Name" header="Роль">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
      </DataTable>
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
        </tr>
      </table>
    </div>
    <p />
    <Toolbar>
      <template #start>
        <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
          :disabled="!UserRightStore.selectedRows || !UserRightStore.selectedRows.length"
          @click="UserRightStore.clickEntityDelete" />
        <Button label="Добавить" icon="pi pi-plus" class="p-button-success" @click="clickEntityAdd" />
      </template>
    </Toolbar>
    <DataTable :value="UserRightStore.DocData.Entity" showGridlines v-model:selection="UserRightStore.selectedRows"
      dataKey="id" editMode="cell" size="small" @cell-edit-complete="onCellEditComplete($event)">
      <Column selectionMode="multiple" style="width: 0.1%" />
      <Column field="id" header="Код" style="width: 0.1%" />
      <Column field="ModuleName" header="Модуль" style="width: 3%" />
      <Column field="_ModuleName" header="Модуль" style="width: 3%" />
      <Column field="FormName" header="Форма" style="width: 3%" />
      <Column field="_FormName" header="Форма" style="width: 3%" />
      <Column field="Write" header="Право на изменение" style="width: 1%">
        <template #editor="{ data, field }">
          <Checkbox id="binary" v-model="data[field]" :binary="true" />
        </template>
        <template #body="slotProps">
          <Checkbox id="binary1" v-model="slotProps.data.Write" :binary="true" />
        </template>
      </Column>
      <Column field="Name" header="Наименование" style="width: 3%">
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
import { useDocHandlerStore } from '~/stores';
import { Toast } from 'primevue';
const toast = useToast();
const route = useRoute();
// const selectedUserDoc = ref();
const UserRightStore = useDocHandlerStore('UserRight');
await UserRightStore.mount({
  module: 'userdocright',
  form: 'UserRight',
  id: route.query?.id as string
});
//console.log('UserRightStore = ', toRaw(UserRightStore));
const Token = localStorage.getItem('Token') || '';
const modulesFormsArr: any = [];
const getMenuItems = async () => {
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
}
await getMenuItems();
// console.log('modulesFormsArr=', modulesFormsArr);
const arr = toRaw(UserRightStore.DocData.Entity);
arr.forEach((row: any) => {
  const moduleRow = modulesFormsArr.find((m: any) => m.module === row.ModuleName);
  const formRow = moduleRow.formsArr.find((m: any) => m.form === row.FormName);
  row._ModuleName = moduleRow.moduleName;
  // console.log('moduleRow=', moduleRow);
  if (formRow) {
    row._FormName = formRow.Name;
  }
});
// UserRightStore.DocData.Entity = arr;
// const UserDocStore = useDocHandlerStore('UserDoc');
// await UserDocStore.mount({
//   module: 'dictionary',
//   form: 'UserDoc',
//   id: 0
// });
const UserDocStore: any = await post({
  Token: localStorage.getItem('Token') || '',
  module: 'dictionary',
  form: 'UserDoc',
  method: 'getUserReestr',
  data: { DocMovement: {} }
});
if (UserDocStore.Error) {
  toast.add({
    severity: 'error', summary: UserDocStore.Error, life: 3000
  });
}
const userChange = () => {
  if (selectedUser.value && !UserRightStore.DocData.DocMovement.Name) {
    UserRightStore.DocData.DocMovement.Name = selectedUser.value.Login;
  }
}

//Получаем всех пользователей для которого уже сделан этот документ
const AllUserRight: any = await get({
  Token,
  module: 'userdocright',
  form: 'UserRight',
  id: 0
});

if (AllUserRight.Error) { // Правильно ли сделано?
  toast.add({
    severity: 'error', summary: AllUserRight.Error, life: 3000
  });
}

const filteredUser = ref();
const selectedUser = ref();
const searchUser = async ({ query = '' }) => {
  //Нужно показывать только тех пользователей, для которых нет такого документа
  const allowUser = UserDocStore.Entity.filter((user: any) => !AllUserRight.Entity.find((already: any) => already.User_id === user.id));
  //const allowUser = UserDocStore.DocData.Entity;
  setTimeout(() => {
    if (!query.trim().length) {
      filteredUser.value = [...toRaw(allowUser)];
    } else {
      filteredUser.value = toRaw(allowUser).filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}
const clearUser = () => {
  selectedUser.value = null;
}
const User_id = UserRightStore.DocData.DocMovement.User_id;
selectedUser.value = UserDocStore.Entity.find((r: any) => r.id == User_id);

//Получаем все роли, которые уже добавлены в табличку
const UserRolesStore: any = useDocHandlerStore('UserRoles');
console.log('UserRolesStore = ', UserRolesStore);

//const selectedRows:any = ref();
const UserRolesResponse: any = await post({
  module: 'userdocright',
  form: 'UserRolesForm',
  data: { DocMovement: { Parent: route.query.id as string } },
  method: 'getUserRolesForm',
  Token: Token
});
console.log('UserRolesResponse = ', toRaw(UserRolesResponse));


if (UserRolesResponse.Error) {
  toast.add({
    severity: 'error', summary: UserRolesResponse.Error, life: 3000
  });
}
else {
  UserRolesResponse.Entity.forEach((row: any) => {
    if (row.id) {
      UserRolesStore.DocData.Entity.push(row);
    }
  })
}

//Получаем все роли для вывода списка ролей
const RoleDocStore: any = await get({
  Token,
  module: 'userdocright',
  form: 'RoleDoc',
  id: 0
})

if (RoleDocStore.Error) { // Правильно ли сделано?
  toast.add({
    severity: 'error', summary: RoleDocStore.Error, life: 3000
  });
}

console.log('UserRolesStore = ', unref(UserRolesStore.DocData.Entity));
console.log('RoleDocStore = ', unref(RoleDocStore));
const filteredRole = ref();
const selectedRole = ref();
//Если данная роль уже есть у пользователя, не нужно выводить на выбор эту роль
const searchRole = async ({ query = '' }) => {
  const AlreadyInTable = toRaw(UserRolesStore.DocData.Entity);
  const allowRole = RoleDocStore.Entity.filter((role: any) => !AlreadyInTable.find((already: any) => already.Role_Name === role.Name));
  setTimeout(() => {
    if (!query.trim().length) {
      filteredRole.value = [...toRaw(allowRole)];
    } else {
      filteredRole.value = toRaw(allowRole).filter(({ Name = '' }: any) => {
        return !!Name.toLowerCase().includes(query.toLowerCase());
      });
    }
  }, 250);
}
const clearRole = () => {
  selectedRole.value = null;
}

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
    // console.log('row=', row);
    if (!formArr.some((m: any) => m.form === row.form)) {
      formArr.push({ Name: row.Name, form: row.form });
    }
  });
}
const filteredForm = ref();
const selectedForm = ref();
const searchForm = async ({ query = '' }) => {
  // надо удалить то что уже есть в табличной части
  formArr.forEach((row: any) => {
    const alreadyInTable = toRaw(UserRightStore.DocData.Entity);  //Уже в таблице есть
    const _selectedModule = selectedModule.value.module; //Выбранный модуль
    const allForms = modulesFormsArr.find((m: any) => m.module === _selectedModule).formsArr; //Все формы выбранного модуля form
    //console.log('allForms = ', allForms);
    const alreadyInTableThisModule = alreadyInTable.filter((item: any) => item.ModuleName === _selectedModule) //Есть в этой таблице формы выбранного модуля
    setTimeout(() => {
      if (!query.trim().length) {
        filteredForm.value = [...objectArrayDifference(allForms, alreadyInTableThisModule, 'form', 'FormName')];
      } else {
        filteredForm.value = objectArrayDifference(allForms, alreadyInTableThisModule, 'form', 'FormName').filter(({ Name = '' }: any) => {
          return !!Name.toLowerCase().includes(query.toLowerCase());
        });
      }
    }, 250);
  });
}
function objectArrayDifference(array1: any, array2: any, prop1: any, prop2: any) {
  return array1.filter((item1: any) => !array2.find((item2: any) => item1[prop1] === item2[prop2]))
}
const clearForm = () => {
  selectedForm.value = null;
}

function checkUserDataResponse(Name: any): boolean {
  if (!Name) {
    toast.add({
      severity: 'error', summary: "Выберите пользователя, которому хотите дать права.", life: 3000
    });
    return false;
  }
  return true;
}

const clickEntityAdd = async () => {
  if (!checkUserDataResponse(selectedUser.value?.Name ?? selectedUser.value?.Login)) return;
  // Проверяем, есть ли уже у пользователя такие модуль + форма
  const isDocAlreadyAssigned = UserRightStore.DocData.Entity.some(
    (item: any) => item.ModuleName === toRaw(selectedModule.value?.module) && item.FormName === toRaw(selectedForm.value?.form)
  );

  if (isDocAlreadyAssigned) {
    toast.add({
      severity: 'error', summary: 'Выбранный документ уже назначен пользователю.', life: 3000
    })
  }
  else {
    if (selectedForm.value.form) {
      UserRightStore.DocData.Entity.push({
        User_id: selectedUser.value?.id,
        User_Name: selectedUser.value?.Name ?? selectedUser.value?.Login,
        ModuleName: selectedModule.value.module,
        FormName: selectedForm.value.form,
      });
    }
  }
}

const clickEntityAddRole = async () => {
  if (!checkUserDataResponse(selectedUser.value?.Name ?? selectedUser.value?.Login)) return;
  // 2. Проверяем, есть ли уже такая роль у пользователя
  const isRoleAlreadyAssigned = UserRolesStore.DocData.Entity.some(
    (item: any) => item.Role_id === selectedRole.value.id && item.User_id === selectedUser.value?.id
  );

  if (isRoleAlreadyAssigned) {
    toast.add({
      severity: 'error', summary: 'Выбранная роль уже назначена пользователю', life: 3000
    })
  }
  else {
    UserRolesStore.DocData.Entity.push({
      User_id: selectedUser.value?.id,
      User_Name: selectedUser.value?.Name ?? selectedUser.value?.Login,
      Role_id: selectedRole.value.id,
      Role_Name: selectedRole.value.Name,
      Parent: UserRightStore.DocData.DocMovement.id
    })
  }
}

const clickSave = async () => {
  if (!checkUserDataResponse(selectedUser.value?.Name ?? selectedUser.value?.Login)) return;
  const uniqueUserRightResponse: any = await post({
    module: 'userdocright',
    form: 'UserRight',
    data: {},
    method: 'UniqueUserRight',
    Token: Token
  });
  if (uniqueUserRightResponse.Error) {
    toast.add({
      severity: 'error', summary: uniqueUserRightResponse.Error, life: 3000
    });
    return;
  }
  UserRightStore.DocData.DocMovement.User_id = selectedUser.value.id;
  UserRightStore.DocData.DocMovement.User_Name = selectedUser.value?.Name ?? selectedUser.value?.Login;
  UserRightStore.DocData.DocMovement.Name = selectedUser.value.Name;

  const body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'userdocright',
    form: 'UserRolesForm',
    data: { Entity: unref(UserRolesStore.DocData.Entity) }
  };
  const { Error = null, Message = null } = await post(body);
  if (Error === 'Token is expired') {
    // return navigateTo('/auth');
  };
  if (Error) {
    UserRightStore.DocData.Error = Error;
    console.log('Error=', Error);
  } else {
    UserRightStore.DocData.Message = Message || 'Документ сохранён';
    // window.location.reload();
  }
  await UserRightStore.clickSave();
}

const onCellEditComplete = (event: any) => {
  // console.log('event=', event);
  if (!event) { return; }
  let { data, newValue, field } = event;
  data[field] = newValue;
}
onMounted(async () => {
  //setToast(UserRightStore.DocData, toast);
  //setWatch(UserRightStore.DocData, toast);
  await searchModule({ query: '' });
  setToast(UserRightStore.DocData, toast);
});

</script>
