// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

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

  // --- CONFIGURACIÓN DE RUNTIME COMPLETA Y CORREGIDA ---
  runtimeConfig: {
    // Clave secreta, solo accesible en el servidor.
    projectApiKey: process.env.PROJECT_API_KEY,

    // Claves públicas, seguras para el navegador.
    public: {
      endpoint: process.env.ENDPOINT,
      project: process.env.PROJECT,
      database: process.env.DATABASE,
      cProducts: process.env.C_PRODUCTS,
      cDeposits: process.env.C_DEPOSITS,
      cQuotes: process.env.C_QUOTES,
      cActionPasswords: process.env.C_ACTION_PASSWORDS,
      cRecords: process.env.C_RECORDS,
      cReferrals: process.env.C_REFERRALS,

      // ✅ AÑADIMOS LA NUEVA VARIABLE PARA LA COLECCIÓN DE CLIENTES
      cClients: process.env.C_CLIENTS,
    },
  },

  // --- BLOQUE PARA AÑADIR LA TIPOGRAFÍA MODERNA "Inter" ---
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
