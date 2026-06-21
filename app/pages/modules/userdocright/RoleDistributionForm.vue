<template>
  <div>
    <div>
      <Toolbar>
        <template #start>
          <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'userdocright' })" />
        </template>
      </Toolbar>
      <Toast position="center" />
    </div>
    <br>
    <table>
      <tr>
        <td> <b>Роль:</b> </td>
        <td>
          <AutoComplete v-model="selectedRole" :suggestions="filteredRole" :dropdown="true" optionLabel="Name"
            forceSelection @complete="searchRole($event)" @clear="clearRole">
          </AutoComplete>
        </td>
        <td> Выберите Роль, права которой хотите присвоить </td>
      </tr>
      <tr>
        <td> <b>Документ:</b> </td>
        <td>
          <!-- <AutoComplete v-model="selectedForm" :suggestions="filteredForm" :dropdown="true" optionLabel="Name"
            forceSelection @complete="searchForm($event)" @clear="clearForm">
          </AutoComplete> -->
          StudentList
        </td>
        <td>
          <Button label="Удалить старые права и Присвоить новые права пользователям" icon="pi pi-file-edit"
            class="p-button-success" @click="clickHandleStudentList" />
        </td>
        <td>Выберите документ в котором есть поле User_id, этим пользователям будут присвоены права выбранной Роли </td>
      </tr>
      <tr>
        <td> <b>Документ:</b> </td>
        <td>
          <!-- <AutoComplete v-model="selectedForm" :suggestions="filteredForm" :dropdown="true" optionLabel="Name"
            forceSelection @complete="searchForm($event)" @clear="clearForm">
          </AutoComplete> -->
          TutorList
        </td>
        <td>
          <Button label="Удалить старые права и Присвоить новые права Тьюторам" icon="pi pi-file-edit"
            class="p-button-success" @click="clickHandleTutorList" />
        </td>
        <td>Выберите документ в котором есть поле User_id, этим пользователям будут присвоены права выбранной Роли </td>
      </tr>
    </table>
  </div>
</template>
<script setup lang="ts">
import { clickBack } from '~/utils';
import { useToast } from 'primevue/usetoast';
import { useDocHandlerStore } from '~/stores'
const toast = useToast();
const RoleDocStore = useDocHandlerStore('RoleDoc');
await RoleDocStore.mount({
  module: 'userdocright',
  form: 'RoleDoc',
  id: 0
});
const filteredRole = ref();
const selectedRole = ref();
const searchRole = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredRole.value = [...toRaw(RoleDocStore.DocData.Entity)];
    } else {
      filteredRole.value = toRaw(RoleDocStore.DocData.Entity).filter(({ Name = '' }: any) => {
        return !!Name.toLowerCase().includes(query.toLowerCase());
      });
    }
  }, 250);
}
const clearRole = () => {
  selectedRole.value = null;
}
const clickHandleStudentList = async () => {
  if (!selectedRole.value?.id) {
    setToast({ Error: 'Не выбрана роль' }, toast);
    return;
  }
  console.log('selectedRole.value=', selectedRole.value);
  const StudentListDocStore = useDocHandlerStore('StudentListDoc');
  await StudentListDocStore.mount({
    module: 'education',
    form: 'StudentListDoc',
    id: 0
  });
  const studentList = toRaw(StudentListDocStore.DocData.Entity);
  const Entity = studentList.map((r: any) => r.User_id);
  console.log('Entity=', Entity);
  const Token = localStorage.getItem('Token') ?? '';
  const body: MessageBody = {
    Token,
    module: 'userdocright',
    form: 'RoleDoc',
    method: 'setRole',
    data: { DocMovement: { id: selectedRole.value.id }, Entity }
  };
  const { Error = null } = await post(body);
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
  } else {
    toast.add({ severity: 'success', summary: 'Права присвоены', life: 3000 });
  }
}
const clickHandleTutorList = async () => {
  if (!selectedRole.value?.id) {
    setToast({ Error: 'Не выбрана роль' }, toast);
    return;
  }
  console.log('selectedRole.value=', selectedRole.value);
  const TutorListDocStore = useDocHandlerStore('TutorListDoc');
  await TutorListDocStore.mount({
    module: 'education',
    form: 'TutorListDoc',
    id: 0
  });
  const studentList = toRaw(TutorListDocStore.DocData.Entity);
  const Entity = studentList.map((r: any) => r.User_id);
  console.log('Entity=', Entity);
  const UserAuthID = localStorage.getItem('UserAuthID') ?? '';
  const body: MessageBody = {
   //UserAuthID,
    module: 'userdocright',
    form: 'RoleDoc',
    method: 'setRole',
    data: { DocMovement: { id: selectedRole.value.id }, Entity }
  };
  const { Error = null } = await post(body);
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
  } else {
    toast.add({ severity: 'success', summary: 'Права присвоены', life: 3000 });
  }
}
onMounted(async () => {
  setToast(RoleDocStore.DocData, toast);
});
</script>
<style>
@import 'primeicons/primeicons.css';
</style>