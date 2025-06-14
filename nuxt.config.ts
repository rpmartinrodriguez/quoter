// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  // ✅ Volvemos a la configuración manual de build y modules que sabemos que funciona
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  // Mantenemos nuestro archivo de estilos globales
  css: ['~/assets/css/main.css'],
  
  // Mantenemos toda la configuración de runtime y la tipografía
  runtimeConfig: {
    projectApiKey: process.env.PROJECT_API_KEY,
    public: {
      endpoint: process.env.ENDPOINT,
      project: process.env.PROJECT,
      database: process.env.DATABASE,
      cProducts: process.env.C_PRODUCTS,
      cDeposits: process.env.C_DEPOSITS,
      cQuotes: process.env.C_QUOTES,
      cActionPasswords: process.env.C_ACTION_PASSWORDS,
      cRecords: process.env.C_RECORDS,
    },
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap', rel: 'stylesheet' }
      ]
    }
  },

  ssr: false,
});
