import Aura from '@primeuix/themes/aura';
import { baseURL, ORG, dadataToken, businessFormName } from "./config";

export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@primevue/nuxt-module',
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', 'acceptHMRUpdate'],
      },
    ]
  ],
  css: ['assets/css/main.css'],
  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    },
    components: {
      include: ['Button', 'Toast', 'InputText', 'Password', 'Toolbar', 'DataTable', 'Column', 'PickList', 'AutoComplete', 'Dialog', 'FileUpload', 'DatePicker', 'InputMask', 'Textarea', 'Image', 'Stepper', 'StepperPanel', 'Rating', 'ToggleButton', 'DataView', 'Galleria']
    }
  },
  runtimeConfig: {
    // The private keys which are only available server-side
    apiSecret: '123',
    public: {
      baseURL,
      ORG,
      dadataToken,
      FORMNAMESREPLACE: [],
      businessFormName
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
