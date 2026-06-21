export const useDocHandlerStore = (docName: string) => defineStore(`docHandler-store-${docName}`, () => {
  const DocData = reactive({
    DocMovement: {} as any,
    //DocMovement: [{}],
    Entity: [] as any,
    FrontFunc: {},
    FormProperties: {},
    Error: '',
    Message: ''
  });
  const selectedRows: any = ref([]);
  let _module: string = '';
  let _form: string = '';
  let _method: string = '';

  async function mount(params: MessageBody) {
    console.log('mount_params=', params);
    _module = params.module || '';
    _form = params.form || '';
    _method = params.method || '';

    const body: MessageBody = {
      module: _module,
      form: _form,
      method: _method,
      Token: localStorage.getItem('Token') || ''
    }
    if (params.id !== undefined) {
      body.id = params.id;
    }
    const {
      DocMovement = {},
      Entity = [],
      FrontFunc = {},
      FormProperties = {},
      Error = '',
      Message = ''
    } = await get(body);

    if (Error === 'Token is expired') {
      return navigateTo('/auth');
    }

    DocData.DocMovement = DocMovement;
    DocData.Entity = Entity;
    DocData.FrontFunc = FrontFunc;
    DocData.FormProperties = FormProperties;
    DocData.Error = Error || '';
    DocData.Message = Message || '';
  }

  async function clickSave() {
    const body: MessageBody = {
      Token: localStorage.getItem('Token') || '',
      module: _module,
      form: _form,
      data: toRaw(DocData)
    }
     console.log('body=', body);

    const { Error = null, Message = null } = await post(body);
    if (Error === 'Token is expired') {
      // return navigateTo('/auth');
    }
    if (Error) {
      DocData.Error = Error;
      console.log('Error=', Error);
    } else {
      DocData.Message = Message || 'Документ сохранён';
      // window.location.reload();
    }
  }

  async function clickEntityNew(type?: string) {
    const DocMovement: any = toRaw(DocData.DocMovement);
    const Entity: any = toRaw(DocData.Entity);
    if (!Entity.length || type === 'createEntity') {
      const body: MessageBody = {
        Token: localStorage.getItem('Token') || '',
        module: _module,
        form: _form,
        data: { Entity: [{ Parent: DocMovement.id }] }
      }
      const answer = await post(body);

      if (answer.Error) {
        DocData.Error = answer.Error;
        console.log('Error=', answer.Error);
      } else {
        DocData.Entity.push(...(answer.Entity || []));
      }
    } else {
      // Если id не из БД считаем в отрицательную сторону
      const newEntity: any = {};
      if (type === 'nameIsWhitespace') {
        newEntity.Name = '_';
      }
      const minID = Math.min(...Entity.map(({ id = 0 }: any) => id), 0);
      newEntity.id = minID > 0 ? -1 : minID - 1;
      newEntity.form = Entity[0].form;
      newEntity.org = Entity[0].org;
      newEntity.Parent = Entity[0].Parent;
      DocData.Entity.push(newEntity);
    }
  }

  async function clickEntityDelete() {
    let _selectedRows = unref(selectedRows);
    console.log('selectedRows=', _selectedRows);

    if (_selectedRows.some(({ id }: any) => id < 0)) {
      const newTable: any = [];
      _selectedRows.forEach((row: any) => {
        if (row.id > 0) {
          newTable.push(row);
        }
      });
      _selectedRows = newTable;
    }
    if (!_selectedRows.length) {
      DocData.Entity = [];
      selectedRows.value = [];
      return;
    }
    const formToDelete = _selectedRows[0].form;
    const body = {
      module: _module,
      form: formToDelete,
      data: { Entity: _selectedRows },
      Token: localStorage.getItem('Token') || ''
    };
    const { Error, Message } = await deleteRows(body);
    if (Error) {
      DocData.Error = Error;
    } else {
      DocData.Message = Message || '';
      const newTable: any = ref([]);
      unref(DocData.Entity).forEach((row: any) => {
        if (!_selectedRows.some((r: any) => row.id === r.id)) {
          newTable.value.push(row);
        }
      });
      DocData.Entity = newTable;
      selectedRows.value = [];
    }
  }

  function onCellEditComplete(event: any) {
    // console.log('event=', event);
    if (!event) { return; }
    let { data, newValue, field } = event;
    if (field.includes('_id')) { return; } // User_id
    data[field] = newValue;
  }

  return {
    DocData: toRefs(DocData),
    mount,
    clickSave,
    clickEntityNew,
    clickEntityDelete,
    onCellEditComplete,
    selectedRows: toRef(selectedRows)
  }
})();

