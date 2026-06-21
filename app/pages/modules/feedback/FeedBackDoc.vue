<template>
  <div class="products-page">
    <div class="fixed">
      <Toast position="center" />
      <Toolbar>
        <template #center>
          <Button label="Назад" icon="pi pi-chevron-left" @click="_clickBack" />
          <Button label="Добавить отзыв" icon="pi pi-plus" @click="clickAddFeedBack" />
        </template>
      </Toolbar>
    </div>
    <div>
      <p />
      <Image :src="imageCard" alt="Фото" width="33%" height="50%" />
      <p />
      <label class="image-caption">{{ NameCard }}</label>
      <Image v-bind:src="image" v-for="image in images" width="33%" height="50%" />
      <p v-for="(item, index) in FeedBackEntity" :key="index">
        <label v-if="item.DocMovement?.Text" style="color: green">
          {{ item.DocMovement.User_Name }}: {{ item.DocMovement.Text }}
        </label>
        <p v-for="(i, indh) in item.Entity" :key="indh">
          <Image v-bind:src="getImageUrl(FileStorage_id, '1')" v-for="FileStorage_id in i" width="20%" height="30%" />
        </p>
        <Divider />
      </p>

      <Dialog v-model:visible="visible" modal header="Отзыв" :style="{ width: '20%' }">
        <div align="center">
          <p>Как вам товар?</p>
          <p>
            <Rating v-model="rating" :cancel="false" />
          </p>
          <Textarea v-model="Text" autoResize rows="5" cols="30" />
          <br>
          <p v-for="(item, indh) in fileImages" :key="indh">
            <Image :src="item.fileUrl" alt="Фото" width="33%" height="50%" />
          </p>
          <FileUpload mode="basic" name="demo[]" :customUpload="true" :maxFileSize="100000000"
            chooseLabel="Добавить фото\видео товара" :auto="true" @uploader="myUploader" />
          <p />
          <Button label="Отправить отзыв" icon="pi pi-send" class="p-button-success" @click="clickSend" />
          <Divider />

        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const route = useRoute();
import { useDocHandlerStore } from '~/stores'
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const fileImages: any = ref([]);

const rating = ref(0);
const Text = ref(null);
const Entity: any = ref([{}]);
const Token = localStorage.getItem('Token') || '';
//console.log('ProductCard_id = ', ProductCard_id);
const FeedBackDoc: any = ref();
const FeedBackEntity: any = ref();
const FeedBackDocStore = useDocHandlerStore('FeedBackDoc');
const images: any = [];
const visible = ref(false);

let ProductCard_id: any, ServiceCard_id: any;
const Analytics = route.query.Analytics;
const typeOfSale = route.query.typeOfSale;

const DocData = await post({
  Token,
  module: 'feedback',
  form: 'FeedBackDoc',
  data: { DocMovement: { Analytics, typeOfSale } },
  method: 'getFeedBack'
});

FeedBackDoc.value = DocData.DocMovement;

FeedBackEntity.value = DocData.Entity;
rating.value = Number(toRaw(FeedBackDoc.value.Level)) || 0;
console.log('FeedBackEntity.value = ', FeedBackEntity.value)
toRaw(FeedBackEntity.value).forEach((row: any) => {
  if (row.Text) {
    Entity.value.push({
      Text: row.Text.toString(),
      User_Name: row.User_Name
    });
  }
});

const imageCard = getImageUrl(FeedBackDoc.value.FileStorage_id, FeedBackDoc.value.org)
const NameCard = FeedBackDoc.value.Name || 'Товар';

const clickSend = async () => {
  console.log('FeedBackDoc = ', unref(FeedBackDoc));
  FeedBackDocStore.DocData.DocMovement.ProductCard_id = ProductCard_id;
  FeedBackDocStore.DocData.DocMovement.User_Name = FeedBackDoc.value.User_Name;
  FeedBackDocStore.DocData.DocMovement.User_id = FeedBackDoc.value.User_id;
  FeedBackDocStore.DocData.DocMovement.Level = Number(rating.value);
  FeedBackDocStore.DocData.Entity.push({
    Text: Text.value,
    Parent: FeedBackDoc.value.id,
    User_id: FeedBackDoc.value.User_id,
    User_Name: FeedBackDoc.value.User_Name, 
    Level: Number(rating.value)
  });
  const body: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'feedback',
    form: 'FeedBackDoc',
    data: { DocMovement: unref(FeedBackDocStore.DocData.DocMovement) }
  };
  const bodyEntity: MessageBody = {
    Token: localStorage.getItem('Token') || '',
    module: 'feedback',
    form: 'FeedBackEntityDoc',
    data: { Entity: toRaw(FeedBackDocStore.DocData.Entity) }
  };
  const { Error = null, Message = null, Entity = [] } = await post(bodyEntity);

  let EntityId: any;
  if (Entity.length > 0) {
    const firstEntity = Entity[0];
    if (firstEntity && 'id' in firstEntity) {
      EntityId = firstEntity.id;
    }
    fileImages.value.forEach(async (row: any) => {
      const bodyAppendix: MessageBody = {
        Token: localStorage.getItem('Token') || '',
        module: 'feedback',
        form: 'FeedBackAppendixDoc',
        data: { DocMovement: { FileStorage_id: row.FileStorage_id, Parent: EntityId } }
      };
      const response = await post(bodyAppendix);
      if (response.Error) {
        console.log(Error);
      }
    });
  }

  if (Error === 'Token is expired') {
  };
  if (Error) {
    FeedBackDocStore.DocData.Error = Error;
    console.log('Error=', Error);
  } else {
    FeedBackDocStore.DocData.Message = Message || 'Документ сохранён';
  }
  Text.value = null;
  window.location.reload();
}

const _clickBack = async () => {
  if (rating.value != toRaw(FeedBackDocStore.DocData.DocMovement.Level)) {
    clickSend();
  }
  router.back();
}

const clickAddFeedBack = async () => {
  visible.value = true;
}

const myUploader = async (event: any) => {
  const fileName = event.files[0].name;
  console.log('fileName = ', fileName);
  const entityRow = await uploadFileStorage(event, {
    module: 'feedback',
    form: 'FeedBackEntityDoc',
    data: {
      DocMovement: {
        Parent: FeedBackDoc.value.id,
        Name: fileName,
        Text: Text.value,
        User_id: FeedBackDoc.value.User_id,
        User_Name: FeedBackDoc.value.User_Name
      }
    }
  }, toast);
  if (entityRow.DocData) {
    entityRow.DocData.Type = entityRow.FullFileStorageData.Type;
    FeedBackDocStore.DocData.Entity.Type = entityRow.DocData.Type;
    const fileUrl = getImageUrl(entityRow.FullFileStorageData.id, entityRow.DocData.org);
    fileImages.value.push({ fileUrl, FileStorage_id: entityRow.FullFileStorageData.id })
  }
}

FeedBackEntity.value.forEach((row: any) => {
  if (row.FileStorage_id) {
    const { FileStorage_id, org } = row;
    images.push(getImageUrl(FileStorage_id, org));
  }
});
onMounted(async () => {
  setToast(FeedBackDocStore.DocData, toast);
});
</script>