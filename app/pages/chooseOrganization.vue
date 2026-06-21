<template>
  <div class="container">
    <Toast position="top-right" />
    <div align="center">
      <h1>Выбор Организации</h1>
      <Divider />
      <AutoComplete v-model="selectedOrg" :suggestions="filteredOrg" :dropdown="true" optionLabel="Name" forceSelection
        @complete="searchOrg($event)" @clear="clearOrg">
      </AutoComplete>
      <Divider />
      <Button label="Войти" @click="enterForm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const Token = localStorage.getItem('Token') || '';
const runtimeConfig = useRuntimeConfig();
const filteredOrg = ref();
const selectedOrg = ref();

const { Entity = [] } = await post({
  module: 'session',
  form: 'getOrg',
  method: 'getOrg',
  Token,
});

if (Entity.length === 1) {
  if (Entity[0]) {
    selectedOrg.value = Entity[0];
  }
  selectedOrg.value = { id: runtimeConfig.public.ORG }
  enterForm();
}

const searchOrg = async ({ query = '' }) => {
  setTimeout(() => {
    if (!query.trim().length) {
      filteredOrg.value = [...Entity];
    } else {
      filteredOrg.value = Entity.filter(({ Name = '' }: any) => {
        return !!Name?.toLowerCase().includes(query?.toLowerCase());
      });
    }
  }, 250);
}

const clearOrg = () => {
  selectedOrg.value = null;
}

async function enterForm() {
  console.log('selectedOrg = ', selectedOrg.value.id);
  const org: any = selectedOrg.value.id;

  if (!toRaw(selectedOrg.value.id)) {
    toast.add({ severity: 'error', summary: 'Выберите организацию', life: 3000 });
    return;
  }
  const SetOrgResponse: any = await post({
    module: 'session',
    form: 'setOrg',
    data: { DocMovement: { org } },
    method: 'setOrg',
    Token
  });
  console.log('SetOrgResponse = ', toRaw(SetOrgResponse));

  if (SetOrgResponse.Error) {
    toast.add({
      severity: 'error', summary: SetOrgResponse.Error, life: 3000
    });
  }
  else navigateTo('/modules');
}
</script>