<template>
    <div class="products-page">
        <div class="fixed">
            <Toast position="center" />
            <Toolbar>
                <template #center>
                    <Button label="Назад" icon="pi pi-chevron-left"
                        @click="clickBack({ module: 'dictionary', form: 'PersonalCabinetSeller' })" />
                    <p>|</p>
                    <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="SettingDocStore.clickSave" />
                </template>
            </Toolbar>
        </div>
        <p/>
        <div v-for="column of SettingDocStore.DocData.Entity" :key="column.id">
            {{ column.Description }} : 
            <Checkbox v-if="typeof column.Active === 'boolean'" id="Active" v-model="column.Active" :binary="true" />
            <InputText v-else v-model="column.Properties" />
            <Divider />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const SettingDocStore = useDocHandlerStore('SettingDoc');
await SettingDocStore.mount({
    module: 'shop',
    form: 'SettingDoc',
    id: 0
});
onMounted(async () => {
  setToast(SettingDocStore.DocData, toast);
  setWatch(SettingDocStore.DocData, toast);
});
</script>