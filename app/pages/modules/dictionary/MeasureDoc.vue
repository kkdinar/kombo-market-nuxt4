<template>
    <div>
        <div class="fixed">
            <Toolbar>
                <template #start>
                    <Button label="Назад" icon="pi pi-chevron-left"
                        @click="clickBack({ module: 'dictionary', form: 'MeasureReestr' })" />
                    <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
                </template>
            </Toolbar>
        </div>
        <Toast position="center" />
        <div align="center">
            <label>Наименование Ед.измерения:</label>
            <Textarea id="Name" v-model="MeasureDocStore.DocData.DocMovement.Name" :autoResize="true" rows="2"
                cols="30" />
            <Divider />
            <label>Описание Ед.измерения:</label>
            <Textarea id="Description" v-model="MeasureDocStore.DocData.DocMovement.Description" :autoResize="true"
                rows="5" cols="30" />
        </div>
    </div>
</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
const MeasureDocStore = useDocHandlerStore('MeasureDoc');
await MeasureDocStore.mount({
    module: 'dictionary',
    form: 'MeasureDoc',
    id: route.query.id as string
});
//console.log('TgLogDocStore', toRaw(MeasureDocStore.DocData.DocMovement.Text));

const clickSave = async () => {
    if (!MeasureDocStore.DocData.DocMovement.Name) {
        toast.add({
            severity: 'error', summary: "Поле Наименование Ед.измерения не заполнено", life: 3000
        });
        return;
    }
    await MeasureDocStore.clickSave();
}


onMounted(async () => {
    setToast(MeasureDocStore.DocData, toast);
    setWatch(MeasureDocStore.DocData, toast);
});
</script>