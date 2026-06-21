import Aura from '@primeuix/themes/aura';
import { baseURL, ORG, dadataToken, businessFormName } from "./config";

export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', 'acceptHMRUpdate'],
      },
    ]
  ],
  css: ['~/assets/css/main.css'],
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
  app: {
    head: {
      title: 'Combo Market - Решим любую задачу',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Многопрофильная электронная площадка для размещения частных объявлений и услуг' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,600;1,700;1,800;1,900&display=swap' }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
