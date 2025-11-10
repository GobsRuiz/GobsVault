// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'GobsVault',
      meta: [
        { name: 'description', content: 'Trading de criptomoedas gamificado' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  ssr: false,

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:4000'
    },
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@vee-validate/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-auth-utils',
  ],

  veeValidate: {
    autoImports: true,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage',
    }
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/variables.css',
    '~/assets/css/fonts.css',
    '~/assets/css/reset.css',
  ],

  googleFonts: {
    families: {
      Poppins: true,
    },
  },
})