import type { ToastServiceMethods } from "primevue/toastservice";

const runtimeConfig: any = useRuntimeConfig();
const apiUrl = new URL('api', runtimeConfig.public.baseURL).toString();
export const uploadUrl = new URL('upload', runtimeConfig.public.baseURL).toString();
export const downloadUrl = new URL('download', runtimeConfig.public.baseURL).toString();

async function request(method: 'GET' | 'POST' | 'DELETE', query?: MessageBody, body?: MessageBody): Promise<ApiResponse> {

  let response: ApiResponse = {
    DocMovement: {},
    Entity: [],
    TableData: [],
    Error: null,
    Message: null,
    FrontFunc: {},
    FormProperties: {},
    Token: null
  }

  try {
    const data: any = await $fetch(apiUrl, { method, query, body });
    let json: any = {};
    if (typeof data === 'object') {
      json = data;
    } else {
      json = JSON.parse(data as any);
    }

    const {
      DocMovement = {},
      Entity = [],
      TableData = [],
      Error = null,
      Message = null,
      FrontFunc = {},
      FormProperties = {},
      Token = null } = json;
    response = {
      DocMovement,
      Entity,
      TableData,
      Error,
      Message,
      FrontFunc,
      FormProperties,
      Token
    }
  } catch (error: any) {
    // if (response.Error === 'Token is expired') navigateTo('/auth');
    response.Error = error.message;
  }
  // clear(); // очистка кэша, все полученные данные кэшируются по ключу: url  
  return response;
}

export async function get(query: MessageBody): Promise<ApiResponse> {
  return request('GET', query);
}

export async function post(body: MessageBody): Promise<ApiResponse> {
  return request('POST', undefined, body);
}

export async function deleteRows(body: MessageBody): Promise<ApiResponse> {
  return request('DELETE', undefined, body);
}

export async function uploadFileStorage(event: any, body: any, toast: ToastServiceMethods) {
  // console.log('event=',event);
  const { files = [] } = event;
  const FileStorageData = await getFileStorageData(files[0], toast);
  if (FileStorageData?.Error) {
    return { Error: FileStorageData.Error }
  }
  
  const DocData = await writeFileStorageDataToDoc(FileStorageData, body, toast);
  if (DocData?.Error) {
    return { Error: DocData.Error }
  }

  DocData.module = body.module;
  DocData.form = body.form;
  const FullFileStorageData = await setParentDataToFileStorage(FileStorageData, DocData, toast);
  if (FullFileStorageData?.Error) {
    return { Error: FullFileStorageData.Error }
  }
  // const fileName = files[0].name;
  // const fileType = files[0].type;

  return { FullFileStorageData, DocData };
}

export async function getFileStorageData(file: any, toast: ToastServiceMethods) {
  const Token = localStorage.getItem('Token') || '';

  //const safeFileName = encodeURIComponent(file.name);
  const formData = new FormData();
  formData.append('file', file, file.name);
  const headers = new Headers({ Token});  

  
  const response: any = await $fetch(uploadUrl, {
    method: 'POST',
    headers,
    body: formData
  });
  
  let json: any;
  try {
    if (typeof response === 'object') {
      json = response;
    } else {
      json = JSON.parse(response as any);
    }
  } catch (error: any) {
    console.log(error);
    toast.add({ severity: 'error', summary: error, life: 3000 });
    return { Error: error };
  }

  const { DocMovement, Error } = json;
  // console.log('answer formData=', answer);
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
    console.log(Error);
    return { Error };
  }
  
  return { DocMovement };
}

export async function writeFileStorageDataToDoc(FileStorageData: any, DocBody: any, toast: ToastServiceMethods) {
  DocBody.Token = localStorage.getItem('Token') || '';

  if (DocBody?.data?.DocMovement) {
    const { id, Name } = FileStorageData?.DocMovement;
    DocBody.data.DocMovement.FileStorage_id = id;
    DocBody.data.DocMovement.Name = Name;
  }
  
  const response = await $fetch(apiUrl, { method: 'POST', body: DocBody });

  let json: any;
  try {
    if (typeof response === 'object') {
      json = response;
    } else {
      json = JSON.parse(response as any);
    }
  } catch (error: any) {
    console.log(error);
    toast.add({ severity: 'error', summary: error, life: 3000 });
    return { Error: error };
  }

  const { DocMovement, Error } = json;
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
    console.log(Error);
    return { Error };
  }

  return DocMovement;
}

export async function setParentDataToFileStorage(FileStorageData: any, DocData: any, toast: ToastServiceMethods) {
  const { module, form } = DocData;
  const _DocMovement = {
    ...FileStorageData.DocMovement,
    ParentModuleName: module,
    ParentFormName: form,
    ParentForm_id: DocData?.DocMovement?.id
  }

  // Заполняем данные модуля filestorage
  const body = {
    module: 'filestorage',
    form: 'FileStorage',
    Token: localStorage.getItem('Token') || '',
    data: { DocMovement: _DocMovement }
  };
   //console.log("FileStorageData=", body);
  const response = await $fetch(apiUrl, { method: 'POST', body });
   //console.log('response=', 'FileStorage', response);

  let json: any;
  try {
    if (typeof response === 'object') {
      json = response;
    } else {
      json = JSON.parse(response as any);
    }
  } catch (error: any) {
    console.log(error);
    toast.add({ severity: 'error', summary: error, life: 3000 });
    return { Error: error };
  }

  const { DocMovement, Error } = json;
  if (Error) {
    toast.add({ severity: 'error', summary: Error, life: 3000 });
    console.log(Error);
    return { Error };
  }

  return DocMovement;

}

export async function downloadFileStorage({ id = null, Name = null }) {
  if (!id) {
    console.log('downloadFileStorage id =', id);
    return;
  }
  const query = {
    module: 'filestorage',
    form: 'FileStorage',
    id,
    Token: localStorage.getItem('Token') || ''
  }
  const answer: any = await $fetch(downloadUrl, { method: 'GET', query });
  if (answer.Error) {
    console.log(answer.Error);
  } else {
    const blob = new Blob([answer], { type: 'application/*' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = Name ? Name : 'downloadFileName_' + id;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

export function getImageUrl(FileStorage_id = '', org = '') {
  const imageUrl = new URL(downloadUrl);
  imageUrl.searchParams.set('org', org);
  imageUrl.searchParams.set('module', 'filestorage');
  imageUrl.searchParams.set('form', 'FileStorage');
  imageUrl.searchParams.set('id', FileStorage_id);
  imageUrl.searchParams.set('Token', localStorage.getItem('Token') || '');
  return imageUrl.href;
} 