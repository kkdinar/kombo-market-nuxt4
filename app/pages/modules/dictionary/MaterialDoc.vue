<template>
    <div>
        <div class="fixed">
            <Toolbar>
                <template #start>
                    <Button label="Назад" icon="pi pi-chevron-left"
                        @click="clickBack({ module: 'dictionary', form: 'MaterialReestr' })" />
                    <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
                </template>
            </Toolbar>
        </div>
        <Toast position="center" />
        <div align="center">
            <label>Наименование Материала:</label>
            <Textarea id="Name" v-model="MaterialDocStore.DocData.DocMovement.Name" :autoResize="true" rows="2"
                cols="30" />
            <Divider />
            <label>Описание Материала:</label>
            <Textarea id="Description" v-model="MaterialDocStore.DocData.DocMovement.Description" :autoResize="true"
                rows="5" cols="30" />
        </div>
    </div>
</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
const MaterialDocStore = useDocHandlerStore('MaterialDoc');
await MaterialDocStore.mount({
    module: 'dictionary',
    form: 'MaterialDoc',
    id: route.query.id as string
});
//console.log('TgLogDocStore', toRaw(MeasureDocStore.DocData.DocMovement.Text));

const clickSave = async () => {
    if (!MaterialDocStore.DocData.DocMovement.Name) {
        toast.add({
            severity: 'error', summary: "Поле Наименование материала не заполнено", life: 3000
        });
        return;
    }
    await MaterialDocStore.clickSave();
}


onMounted(async () => {
    setToast(MaterialDocStore.DocData, toast);
    setWatch(MaterialDocStore.DocData, toast);
});
</script>