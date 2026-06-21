<template>
  <div class="request-page">
    <Toast position="center" />

    <div class="toolbar">
      <Button label="Назад" icon="pi pi-chevron-left" class="p-button-text"
        @click="clickBack({ module: 'shop', form: 'ProductCardReestr' })" />
      <Divider layout="vertical" />
      <Button label="Выполнить заявку" icon="pi pi-check" class="p-button-success"
        @click="_fulfil" :disabled="allDisabled" />
    </div>

    <div class="request-content">
      <div v-if="CardEntity" class="request-card">

        <div class="request-card__header">
          <div>
            <p class="request-card__subtitle">Заявка</p>
            <h2 class="request-card__title"># {{ CardEntity.id }}</h2>
          </div>
          <span class="status-badge status-badge--new">
            <i class="pi pi-circle-fill" style="font-size: 10px" />
            Новая
          </span>
        </div>

        <div class="request-meta">
          <div class="request-meta__item">
            <span class="request-meta__label"><i class="pi pi-user" /> Клиент</span>
            <span class="request-meta__value">{{ CardEntity.client_Name }}</span>
          </div>
          <div class="request-meta__item">
            <span class="request-meta__label"><i class="pi pi-calendar" /> Дата</span>
            <span class="request-meta__value">{{ CardEntity.formattedDate }}</span>
          </div>
          <div class="request-meta__item request-meta__item--full">
            <span class="request-meta__label"><i class="pi pi-tag" /> Тип заявки</span>
            <span class="request-meta__value">{{ CardEntity.type_Req }}</span>
          </div>
        </div>

        <Divider />

        <div class="request-actions">
          <Button label="Выполнить" icon="pi pi-check" class="p-button-success"
            @click="_fulfil" :disabled="allDisabled" />
          <Button label="Отклонить" icon="pi pi-ban" class="p-button-danger p-button-outlined"
            @click="_cancel" :disabled="allDisabled" />
          <Button label="Уточнения по заявке" icon="pi pi-question-circle" class="p-button-info p-button-outlined"
            @click="_application" :disabled="allDisabled" />
        </div>

      </div>
    </div>

    <!-- Диалог: заявка выполнена -->
    <Dialog v-model:visible="visible" modal header="Заявка успешно выполнена!" :style="{ width: '22rem' }">
      <p style="text-align: center; color: var(--text-color-secondary)">
        Клиент получил уведомление.
      </p>
    </Dialog>

    <!-- Диалог: уточнения по заявке -->
    <Dialog
      v-model:visible="applicationVisible"
      modal
      :header="`Уточнения по заявке № ${route.query.id}`"
      :style="{ width: '32rem' }"
    >
      <div class="application-dialog">
        <p class="application-dialog__hint">
          Введите вопрос — клиент получит его в мессенджере.
        </p>
        <Textarea
          v-model="applicationQuestion"
          rows="4"
          autoResize
          placeholder="Например: уточните артикул или единицу измерения…"
          style="width: 100%"
        />
      </div>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" class="p-button-text"
          @click="applicationVisible = false" />
        <Button label="Отправить" icon="pi pi-send" class="p-button-info"
          @click="_sendApplication" :loading="applicationLoading" :disabled="!applicationQuestion.trim()" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const Request: any = ref([]);
const CardEntity: any = ref();
const visible = ref(false);
const toast = useToast();
const applicationVisible = ref(false);
const applicationQuestion = ref('');
const applicationLoading = ref(false);

const Token = localStorage.getItem('Token') || '';
const allDisabled = ref(false);

// const fillEntity = async () => {
const { Entity = [] } = await post({
    module: 'request',
    form: 'RequestDoc',
    method: 'getRequest',
    data: { DocMovement: { id: route.query.id as string } },
    Token,
});

console.log('currentRequest', Entity);

if (Entity.length === 1) {
    if (Entity[0]) {
        CardEntity.value = Entity[0];
    }
    //CardEntity.value = { id: runtimeConfig.public.ORG }
}


async function _fulfil() {
    if (Entity.length === 1) {
        let form;
        if (CardEntity.value.Type = 'new_Material') {
            form = 'MaterialDoc';
        }
        if (CardEntity.value.Type = 'new_Service') {
            form = 'ServiceDoc';
        }
        if (CardEntity.value.Type = 'new_Measure') {
            form = 'MeasureDoc';
        }
        const response = await post({
            module: 'dictionary',
            form: form,
            data: { DocMovement: { Name: CardEntity.value.Name } },
            Token,
        });
        if (response.DocMovement) {
            visible.value = true;
            const responseMessage: any = await post({
                module: 'message',
                form: 'MessengerDoc',
                method: 'getMessengerDocByRequest_id',
                data: { DocMovement: { Request_id: route.query.id } },
                Token,
            });
            if (responseMessage.Error) {
                toast.add({
                    severity: 'error', summary: responseMessage.Error, life: 3000
                });
                console.log('Error=', responseMessage.Error);
            }
            else {
                const id = responseMessage.DocMovement.id;
                const body: MessageBody = {
                    Token: localStorage.getItem('Token') || '',
                    module: 'message',
                    form: 'MessengerDoc',
                    data: {
                        DocMovement: {
                            Parent: id,
                            Text: 'Ваша заявка № ' + route.query.id + ' выполнена',
                            Date: new Date(),
                            Status: 'sent'
                        }
                    }
                }
                const answer = await post(body);
                if (answer.Error) {
                    toast.add({
                        severity: 'error', summary: answer.Error, life: 3000
                    });
                    console.log('Error=', answer.Error);
                } else {
                    // Помечаем заявку как отклонённую через API
                    const fulfilResponse: any = await post({
                        module: 'request',
                        form: 'RequestEntityDoc',
                        method: 'changingRequestStatus',
                        data: {
                            DocMovement: {
                                id: route.query.id,
                                Status: 'fulfil',
                            },
                        },
                        Token,
                    });
                    const activeResponse: any = await post({
                        module: 'request',
                        form: 'RequestDoc',
                        data: {
                            DocMovement: {
                                id: route.query.id,
                                Active: false,
                            },
                        },
                        Token,
                    });
                    allDisabled.value = true;
                    //window.location.reload();
                }
            }
        }
    }
}

async function _cancel() {
    if (!CardEntity.value) return;
    try {
        // Находим мессенджер-диалог по id заявки
        const responseMessage: any = await post({
            module: 'message',
            form: 'MessengerDoc',
            method: 'getMessengerDocByRequest_id',
            data: { DocMovement: { Request_id: route.query.id } },
            Token,
        });

        if (responseMessage.Error) {
            toast.add({
                severity: 'error',
                summary: responseMessage.Error,
                life: 3000,
            });
            console.log('Error=', responseMessage.Error);
            return;
        }

        const id = responseMessage.DocMovement.id;

        // Отправляем сообщение пользователю об отклонении
        const body: MessageBody = {
            Token: localStorage.getItem('Token') || '',
            module: 'message',
            form: 'MessengerDoc',
            data: {
                DocMovement: {
                    Parent: id,
                    Text: 'Ваша заявка № ' + route.query.id + ' отклонена менеджером',
                    Date: new Date(),
                    Status: 'sent',
                },
            },
        };

        const answer = await post(body);

        if (answer.Error) {
            toast.add({
                severity: 'error',
                summary: answer.Error,
                life: 3000,
            });
            console.log('Error=', answer.Error);
            return;
        }

        // Помечаем заявку как отклонённую через API
        const cancelResponse: any = await post({
            module: 'request',
            form: 'RequestEntityDoc',
            method: 'changingRequestStatus',
            data: {
                DocMovement: {
                    id: route.query.id,
                    Status: 'cancel',
                },
            },
            Token,
        });

        if (cancelResponse.Error) {
            toast.add({
                severity: 'error',
                summary: cancelResponse.Error,
                life: 3000,
            });
            console.log('Error=', cancelResponse.Error);
            return;
        }
        else {
            const activeResponse: any = await post({
                module: 'request',
                form: 'RequestDoc',
                data: {
                    DocMovement: {
                        id: route.query.id,
                        Active: false,
                    },
                },
                Token,
            });
            toast.add({
                severity: 'info',
                summary: 'Заявка отклонена',
                detail: 'Пользователь получил уведомление',
                life: 3000,
            });

            allDisabled.value = true;
        }

    } catch (e) {
        console.error('_discard error:', e);
        toast.add({
            severity: 'error',
            summary: 'Непредвиденная ошибка',
            life: 3000,
        });
    }
}

// Открывает диалог уточнений
function _application() {
  applicationQuestion.value = '';
  applicationVisible.value = true;
}

// Отправляет вопрос менеджера клиенту через мессенджер
async function _sendApplication() {
  const text = applicationQuestion.value.trim();
  if (!text) return;

  applicationLoading.value = true;

  try {
    // Находим диалог по id заявки
    const responseMessage: any = await post({
      module: 'message',
      form: 'MessengerDoc',
      method: 'getMessengerDocByRequest_id',
      data: { DocMovement: { Request_id: route.query.id } },
      Token,
    });

    if (responseMessage.Error) {
      toast.add({ severity: 'error', summary: responseMessage.Error, life: 3000 });
      return;
    }

    const id = responseMessage.DocMovement.id;

    // Отправляем вопрос клиенту
    const body: MessageBody = {
      Token,
      module: 'message',
      form: 'MessengerDoc',
      data: {
        DocMovement: {
          Parent: id,
          Text: `Уточнение по заявке № ${route.query.id}: ${text}`,
          Date: new Date(),
          Status: 'sent',
        },
      },
    };

    const answer = await post(body);

    if (answer.Error) {
      toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
      return;
    }

    applicationVisible.value = false;
    applicationQuestion.value = '';
    toast.add({
      severity: 'info',
      summary: 'Вопрос отправлен',
      detail: 'Клиент получил ваш вопрос в мессенджере',
      life: 3000,
    });

  } catch (e) {
    console.error('_application error:', e);
    toast.add({ severity: 'error', summary: 'Непредвиденная ошибка', life: 3000 });
  } finally {
    applicationLoading.value = false;
  }
}

</script>

<style scoped>
.request-page {
  min-height: 100vh;
  background: var(--surface-ground);
}

.toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.request-content {
  display: flex;
  justify-content: center;
  padding: 32px 20px;
}

.request-card {
  width: 100%;
  max-width: 640px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 28px;
}

.request-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.request-card__subtitle {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-bottom: 2px;
}

.request-card__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge--new {
  background: var(--blue-50);
  color: var(--blue-700);
}

.request-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.request-meta__item {
  background: var(--surface-section);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.request-meta__item--full {
  grid-column: 1 / -1;
}

.request-meta__label {
  font-size: 12px;
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
}

.request-meta__value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.request-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.application-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.application-dialog__hint {
  font-size: 14px;
  color: var(--text-color-secondary);
}
</style>