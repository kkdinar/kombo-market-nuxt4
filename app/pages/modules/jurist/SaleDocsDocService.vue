<template>
    <div>
        <div class="fixed">
            <Toolbar>
                <template #start>
                    <Button label="Назад" icon="pi pi-chevron-left" @click="clickBack({ module: 'jurist' })" />
                    <p>|</p>
                    <FileUpload mode="basic" name="demo[]" customUpload :maxFileSize="10000000"
                        chooseLabel="Добавить документ" :auto="true" @uploader="myUploaderEntity" />
                    <p>|</p>
                    <Button label="Удалить" icon="pi pi-trash" class="p-button-danger"
                        :disabled="!selectedRows || !selectedRows.length" @click="_delete" />
                </template>
            </Toolbar>
        </div>
        <Toast position="center" />
        <div align="center">
            <p>Правоустанавливающие документы для услуг:</p>
            <DataTable :value="FilteredRows" showGridlines dataKey="id" editMode="cell" size="small"
                v-model:selection="selectedRows" @cell-edit-complete="onCellEditComplete($event)">
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
</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
let selectedRows: any = ref([]);
const FilteredRows: any = ref([]);
const SaleDocs: any = [];
const fillEntity = async () => {
    const { Entity = [] }: any = await get({
        Token: localStorage.getItem('Token') || '',
        module: "jurist",
        form: "SaleDocsDoc",
        id: 0
    });
    if (Entity?.Error) {
        toast.add({
            severity: 'error', summary: Entity.Error, life: 3000
        });
    }
    SaleDocs.push(Entity);
    for (const { id, Name, Description, FileStorage_id } of Entity) {
        FilteredRows.value.push({ id, Name, Description, FileStorage_id })
    }
}
fillEntity();

const myUploaderEntity = async (event: any) => {
    const fileName = event.files[0].name;
    const entityRow = await uploadFileStorage(event, {
        module: 'jurist',
        form: 'SaleDocsDoc',
        data: {
            DocMovement: {
                Name: fileName,
                Type: 'Service'
            }
        }
    }, toast);
    if (entityRow.Error) {
        toast.add({
            severity: 'error', summary: entityRow.Error, life: 3000
        });
    }
    if (entityRow.DocData) {
        FilteredRows.value.push(unref(entityRow.DocData));
    }
}

const onCellEditComplete = (event: any) => {
    // console.log('event=', event);
    if (!event) { return; }
    let { data, newValue, field } = event;
    console.log('data, newValue, field', data, newValue, field)
    data[field] = newValue;
}

const _delete = async () => {
    for (const row of unref(selectedRows)) {
        const responseDelete = await deleteRows({
            Token: localStorage.getItem('Token') || '',
            module: "jurist",
            form: "SaleDocsDoc",
            data: { DocMovement: row }
        });
        if (responseDelete?.Error) {
            toast.add({
                severity: 'error', summary: responseDelete.Error, life: 3000
            });
        }
        else {
            location.reload();
        }
    }

}

onMounted(async () => {
    // setToast(SaleDocsDoc.DocData, toast);
    // setWatch(SaleDocsDocStore.DocData, toast);
});
</script>

<style>
@import 'primeicons/primeicons.css';
</style>