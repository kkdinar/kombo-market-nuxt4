export const autoCompleteStore = (docName: string) => defineStore(`autoComplete-store-${docName}`, () => {
  const items: any = []; // Из БД
  const suggestions: any = ref([]); //Отфильтрованное
  const model = ref("");
  const insertedValues: any = [];
  let insertedKey = ''; //Наименование поля в документе в таблице
  let itemsKey = ''; //Наименование поля в справочнике в таблице

  async function mount(params: MessageBody) {
    const body: MessageBody = {
      module: params.module,
      form: params.form,
      id: 0,
      Token: localStorage.getItem('Token') || ''
    }

    const {
      Entity = [],
      Error = 'Нет данных'
    } = await get(body);

    if (Error === 'Token is expired') {
      return navigateTo('/auth');
    }
    items.length = 0;
    items.push(...Entity);
    // console.log('autoCompleteStore items=', items);
  }

  async function search({ query = '' }) {
    const filteredNotInsertedItems: any = [];
    if (insertedValues.length) {
      filteredNotInsertedItems.push(...items.filter((row: any) => !insertedValues.includes(row[itemsKey])));
    } else {
      filteredNotInsertedItems.push(...items);
    }
    setTimeout(() => {
      if (!query.trim().length) {
        suggestions.value = [...filteredNotInsertedItems];
      } else {
        suggestions.value = filteredNotInsertedItems.filter((r: any) => {
          return r.Name.toLowerCase().indexOf(query.toLowerCase()) >= 0 ? true : false
        });
      }
      console.log('items,filteredNotInsertedItems,suggestions=', items, filteredNotInsertedItems, suggestions);
    }, 250);
  }

  function setInsertedValues(arr = [], key = '', dictionaryKey = 'null') {
    insertedKey = key;
    if (dictionaryKey === 'null') itemsKey = key;
    else itemsKey = dictionaryKey;
    arr.forEach((row: any) => { //строки из таблицы документа, их уже не надо вставлять из справочника
      if (!insertedValues.includes(row[key])) {
        insertedValues.push(row[key]);
      }
    });
  }

  return {
    mount,
    search,
    setInsertedValues,
    items,
    // suggestions: toRef(suggestions),
    suggestions,
    model: toRef(model)
  }
})();