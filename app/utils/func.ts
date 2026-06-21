import type { ToastServiceMethods } from "primevue/toastservice";

export async function authCheck() {
  if (!localStorage.getItem('Token')) {
    return navigateTo('/auth');
  }
  navigateTo('/modules/shop/ShowCatalog');
}

export const setToast = (DocData: any, toast: ToastServiceMethods) => {
  const errorMessage = unref(DocData.Error);
  const message = unref(DocData.Message);

  if (errorMessage) {
    if (errorMessage === 'Token is expired') {
      return navigateTo('/auth');
    } else {
      console.log('Error=', errorMessage);
      toast.add({ severity: 'error', summary: errorMessage, life: 3000 });
    }
    DocData.Error = '';
  }

  if (message) {
    toast.add({ severity: 'info', summary: message, life: 3000 });
    DocData.Message = '';
  }

  if (!Object.keys(DocData.DocMovement).length && !DocData.Entity.length) {
    toast.add({ severity: 'error', summary: 'Нет данных', life: 3000 });
  }

  return errorMessage;
}

export function isMobile(): boolean {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }
  else {
    return false;
  }
}

export function linkToForm(data: any = {}) {
  let { module = '', form = '', id = '' } = data;
  // console.log('linkToForm=', module, form, id);

  id = id ? '?id=' + id : '';
  module = module ? module + '/' + form + id : '';
  const path = isMobile() ? '/m/modules/' + module : '/modules/' + module;
  return navigateTo(path);
}

/**
 * 
 * @param originalArr Таблица без применения фильтров
 * @param filterText Текст для фильтрации
 * @param filterColumnName Наименования полей, в которых нужно искать текст для фильтрации 
 * @returns Строки таблицы, в столбцах которой нашли переданный текст
 */
export function filterTableRows(originalArr: object[], filterText: string, filterColumnName: string[]): object[] {
  if (filterText === '') {
    return originalArr;
  }

  const rows: object[] = [];
  unref(originalArr).forEach((row: any) => {
    for (const columnName of filterColumnName) {
      if (row[columnName] && row[columnName] !== '') {
        if ((row[columnName].toLowerCase()).includes(filterText.toLowerCase())) {
          rows.push(row);
        }
      }
    }
  });
  return rows;
}

export function clickBack(data: any = {}) {
  const { module, form } = data;
  if (form !== undefined) {
    linkToForm({ module, form });
  } else if (module !== undefined) {
    linkToForm({ module });
  } else if (module === undefined && form === undefined) {
    linkToForm();
  }
}

export function setWatch(DocData: any, toast: ToastServiceMethods) {
  watch(
    () => DocData.Error,
    (mes, prevMes) => {
      if (!prevMes && mes) {
        toast.add({ severity: 'error', summary: mes, life: 3000 });
        DocData.Error = '';
      }
    }
  )
  watch(
    () => DocData.Message,
    (mes, prevMes) => {
      if (!prevMes && mes) {
        toast.add({ severity: 'info', summary: mes, life: 3000 });
        DocData.Message = '';
      }
    }
  )
}

export async function clickNew({ module = '', form = '' }) {
  const data = { DocMovement: {} };
  // for (const key in newDocDefaults) {
  //   data.DocMovement[key] = newDocDefaults[key];
  // }
  const body = {
    module,
    form,
    data,
    Token: localStorage.getItem('Token') || ''
  }
  const { DocMovement = { id: null } as any, Error = 'Нет данных' } = await post(body);
  if (DocMovement && DocMovement.id) {
    console.log('DocMovement = ', DocMovement);
    const id = DocMovement.id;
    linkToForm({ module, form, id });
  } else {
    console.log(Error);
  }
}

export async function clickDelete({ module = '', form = '', selectedRows = [] }) {
  // if (selectedRows.some(({ id }) => id < 0)) {
  //   const newTable: any = [];
  //   selectedRows.forEach((row: any) => {
  //     if (row.id > 0) {
  //       newTable.push(row);
  //     }
  //   });
  //   selectedRows = newTable;
  // }
  const Entity = selectedRows.filter((row: any) => row?.id > 0);

  const body = {
    module,
    form,
    data: { Entity },
    Token: localStorage.getItem('Token') || ''
  }
  const { Error, Message } = await deleteRows(body);
  return { Error, Message }
}

export function formatDate(d: any) {
  if (!d) { return ''; }
  const date = new Date(d);
  let month: any = date.getMonth() + 1;
  if (month < 10) { month = '0' + month; }
  const day = ('0' + date.getDate()).slice(-2);
  return day + '.' + month + '.' + date.getFullYear();
}

export function formatDateTime(d: any) {
  if (!d) { return ''; }
  const date = new Date(d);
  let month: any = date.getMonth() + 1;
  if (month < 10) { month = '0' + month; }
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return day + '.' + month + '.' + date.getFullYear() + ' ' + hours + ':' + minutes + ':' + seconds;
}


export async function getProductSpecificationList(selectedPointSpecification: any = {}, toast: any, docId: any) {
  const selectedIds: any = [];
  for (const key in selectedPointSpecification) {
    if (Object.hasOwnProperty.call(selectedPointSpecification, key)) {
      const element = selectedPointSpecification[key];
      if (element.checked) {
        // console.log('key, element=', key, element);
        const rows = key.split('-');
        rows.forEach((row) => {
          if (!selectedIds.includes(row)) {
            // console.log(row, selectedIds);
            selectedIds.push(row);
          }
        });
      }
    }
  }
  const params: any = {
    module: 'shop',
    form: 'ProductSpecificationDoc',
    id: 0,
    Token: localStorage.getItem('Token') || ''
  };
  let answer: any = await get(params);
  if (answer.Error) {
    toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
  } else {
    let Category_Name = '';
    for (const rowId of selectedIds) {
      const row = answer.Entity.find(({ id }: any) => id === rowId);
      Category_Name = Category_Name ? Category_Name + ',' + row.Name : row.Name;

    }
    return Category_Name;
  }
}

export async function getServiceSpecificationList(selectedServiceSpecification: any = {}, toast: any, docId: any) {
  const selectedIds: any = [];
  for (const key in selectedServiceSpecification) {
    if (Object.hasOwnProperty.call(selectedServiceSpecification, key)) {
      const element = selectedServiceSpecification[key];
      if (element.checked) {
        // console.log('key, element=', key, element);
        const rows = key.split('-');
        rows.forEach((row) => {
          if (!selectedIds.includes(row)) {
            // console.log(row, selectedIds);
            selectedIds.push(row);
          }
        });
      }
    }
  }
  const params: any = {
    module: 'shop',
    form: 'ServiceSpecificationDoc',
    id: 0,
    Token: localStorage.getItem('Token') || ''
  };
  let answer: any = await get(params);
  if (answer.Error) {
    toast.add({ severity: 'error', summary: answer.Error, life: 3000 });
  } else {
    let Category_Name = '';
    for (const rowId of selectedIds) {
      const row = answer.Entity.find(({ id }: any) => id === rowId);
      Category_Name = Category_Name ? Category_Name + ',' + row.Name : row.Name;

    }
    return Category_Name;
  }
}

export async function guestReg(org: number) {
  if (localStorage.getItem('Token')) return;
  let body: MessageBody = {
    module: 'session',
    form: 'auth',
    data: { DocMovement: { org, Login: 'guest', Description: navigator.platform } }
  }
  const runtimeConfig = useRuntimeConfig();
  const businessFormName = runtimeConfig.public.businessFormName;

  const response: ApiResponse = await post(body);
  const Token = response.Token;
  if (Token) {
    localStorage.setItem('Token', Token);
    localStorage.setItem('isGuest', 'true');
    body = {
      Token,
      module: 'business',
      form: businessFormName,
      method: 'setKomboMarketRole',
      data: { DocMovement: { org, roleName: 'komboMarketGuestRole' } }
    }
    await post(body);
  }
}