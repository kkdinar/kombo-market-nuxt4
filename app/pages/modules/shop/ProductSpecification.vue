<template>
  <Toast />
  <Toolbar>
    <template #start>
      <Button label="Назад" icon="pi pi-chevron-left" @click="_clickBack" />
    </template>
  </Toolbar>
  <div align="center">
    <br>
    <h2>Справочник "Описание товара"</h2>
    <br>
    <Tree :value="TreeEntity" selectionMode="checkbox" v-model:selectionKeys="ProductSpecificationDocStore.selectedRows"
      :filter="true" filterMode="lenient">
      <template #default="{ node }">
        <span @contextmenu="onNodeRightClick($event, node)">
          {{ node.label }}
        </span>
      </template>
    </Tree>
    <ContextMenu ref="menu" :model="MenuItems" />
  </div>
  <Dialog :visible.sync="displayModal" :containerStyle="{ width: '50vw' }" :modal="true">
    <div>
      <InputText id="NodeName" v-model="NodeName" type="text" />
    </div>
    <template #footer>
      <Button label="Сохранить" icon="pi pi-save" class="p-button-success" @click="clickSave" />
      <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="closeModal" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import { useDocHandlerStore } from '~/stores'
import { ref } from "vue";
const Token = localStorage.getItem('Token') || '';
const router = useRouter();

const MenuItems = ref([{
  label: 'Изменить',
  icon: 'pi pi-fw pi-pencil',
  command: () => renameNode()
  // items: []
}, {
  label: 'Добавить',
  icon: 'pi pi-fw pi-plus',
  command: () => addNode()
  // items: []
}, {
  label: 'Добавить дочерний',
  icon: 'pi pi-fw pi-sitemap',
  command: () => addChildNode()
}, {
  label: 'Удалить',
  icon: 'pi pi-fw pi-trash',
  command: () => delNode()
}]);

const TreeEntity: any = ref([]);
let MenuNode: any = null;
const NodeName = ref(null);
const displayModal = ref(false);
const menu = ref();

const getChildren = (key: string, id: number, Entity: any) => {
  const rows: object[] = [];
  Entity.forEach((row: any) => {
    if (row.Parent === id) {
      const _key = key + '-' + row.id;
      const children = getChildren(_key, row.id, Entity);
      rows.push({
        key: _key,
        label: row.Name,
        data: row.id,
        icon: null,
        children
      });
    }
  });
  return rows;
}

const ProductSpecificationDocStore = useDocHandlerStore('ProductSpecificationDoc');

const getTree = async () => {
  const { mount, DocData } = ProductSpecificationDocStore;
  await mount({
    module: 'shop',
    form: 'ProductSpecificationDoc',
    id: 0
  });
  if (!DocData.Entity.length) {
    TreeEntity.value.push({
      key: '0',
      label: 'Корень',
      data: '',
      icon: 'pi pi-fw pi-inbox',
      children: []
    });
  } else {
    const rootNode = DocData.Entity.filter(({ Parent }: any) => !Parent);
    rootNode.forEach((row: any) => {
      const key = row.id;
      const children = getChildren(key, row.id, DocData.Entity);
      TreeEntity.value.push({
        key: row.id,
        label: row.Name,
        data: row.id,
        icon: null,
        children
      });
    });
  }
}
await getTree();
console.log('this.TreeEntity=', TreeEntity);

const onNodeRightClick = (event: any, node: any) => {
  // console.log('node=', node);
  MenuNode = node;
  menu.value.show(event);
}
const updateNode = async ({ id = null, Name = 'Новая', Parent = null }) => {
  const formData = {
    Token,
    module: 'shop',
    form: 'ProductSpecificationDoc',
    data: {
      DocMovement: {
        id,
        Name,
        form: 'ProductSpecificationDoc',
        Parent
      }
    }
  }
  const { Error = null } = await post(formData);
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
  } else {
    TreeEntity.value = [];
    await getTree();
  }
}
const addNode = async () => {
  console.log('this.MenuNode=', MenuNode);
  const { key } = MenuNode;
  let Parent = null;
  if (key.includes('-')) {
    const rows = key.split('-');
    Parent = rows[rows.length - 2];// Предпоследий элемент масива
  }
  await updateNode({ Parent });
}
const renameNode = () => {
  displayModal.value = true;
  NodeName.value = MenuNode.label;
}
const closeModal = () => {
  displayModal.value = false;
}
const clickSave = async () => {
  console.log('clickSave=', NodeName.value);
  displayModal.value = false;
  const { data, key } = MenuNode;
  let Parent = null;
  if (key.includes('-')) {
    const rows = key.split('-');
    Parent = rows[rows.length - 2];// Предпоследий элемент масива
  }
  const Name = NodeName.value || '';
  await updateNode({ id: data, Name, Parent });
  NodeName.value = null;
}
const addChildNode = async () => {
  console.log('this.MenuNode=', MenuNode.value);
  const { data } = MenuNode;
  await updateNode({ Parent: data });
}

const delNode = async () => {
  const { data } = MenuNode;
  const formData = {
    Token,
    module: 'shop',
    form: 'ProductSpecificationDoc',
    data: { DocMovement: { id: data } }
  };
  const { Error = null } = await deleteRows(formData);
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
  } else {
    TreeEntity.value = [];
    await getTree();
  }
}

const _clickBack = async () => {
  router.back();
}

onMounted(async () => {
  setToast(ProductSpecificationDocStore.DocData, toast);
  setWatch(ProductSpecificationDocStore.DocData, toast);
});
</script>

<style>
@import 'primeicons/primeicons.css';
</style>