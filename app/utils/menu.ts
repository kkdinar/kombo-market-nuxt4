export async function updateMenuItems(module: string = '') {
  const runtimeConfig = useRuntimeConfig();
  const Token = localStorage.getItem('Token') || '';
  let menuItems: any = [];
  const userMenuItems: any = [];
  let id = 0;
  const FORMNAMESREPLACE: any = runtimeConfig.public.FORMNAMESREPLACE || [];

  // Список выбранных документов в меню
  let answer = await get({
    Token,
    module: 'sitesetting',
    form: 'MainWindowFormList',
    id: 0
  });

  if (answer.Error === 'Token is expired') {
    return navigateTo('/auth');
  }


  const mainWindowFormList: any[] = answer.Entity || [];
  // const mainWindowFormList: any[] = [];

  const modulesArr: any = [];
  // Список модулей
  const { Entity = [] } = await get({ Token });
  console.log('Entity = ', Entity);
  console.log('module = ', module);


  if (module !== '') {
    modulesArr.push(...Entity.filter((r: any) => r.module === module));
  } else {
    modulesArr.push(...Entity);
  }
  // console.log('!!!modulesArr=', modulesArr);

  // Собираем формы по всем модулям
  for await (const Module of modulesArr) {
    const { Entity = [] } = await get({
      module: Module.module,
      Token
    });
    // console.log('Entity=', Entity);

    Entity.forEach((Form: any) => {
      const replaceNames = FORMNAMESREPLACE.filter((r: any) => r.module === Module.module && r.form === Form.form);
      let replaceName = null;
      if (replaceNames.length) {
        replaceName = replaceNames[0].Name;
        // console.log('replaceName=', replaceName);
      }

      if (Form.DisplayForm) {
        id = id + 1;
        const row = {
          id,
          module: Module.module,
          ModuleName: Module.Name,
          form: Form.form,
          FormName: replaceName || Form.Name,
          Module,
          Form
        };

        const inUserList = mainWindowFormList.some((r: any) => r.ModuleName === Form.module && r.Form_Name === Form.form);
        // console.log('Form=', Form, inUserList);
        if (inUserList) { userMenuItems.push(row); }
        menuItems.push(row);
      };
    });
  }
  menuItems = userMenuItems.length > 0 ? userMenuItems : menuItems;
  return menuItems;
}

export async function getModules() {
  const Token = localStorage.getItem('Token') || '';
  const menuItems: any = [];
  let id = 0;
  const modulesArr: any = [];
  // Список модулей
  const { Entity = [] } = await get({ Token });
  modulesArr.push(...Entity);
  // Собираем формы по всем модулям
  for await (const Module of modulesArr) {
    const { Entity = [] } = await get({
      module: Module.module,
      Token
    });
    Entity.forEach((Form: any) => {
      if (Form.DisplayForm) {
        id = id + 1;
        const row = {
          id,
          module: Module.module,
          ModuleName: Module.Name
        }
        if (!menuItems.some(({module}: any) => module === Module.module)) menuItems.push(row);
      }
    });
  }
  return menuItems;
}