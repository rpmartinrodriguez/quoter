// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  // ✅ FORMA RECOMENDADA DE INTEGRAR VUETIFY
  // build: { transpile: ["vuetify"] }, // El módulo oficial puede que ya no necesite esto
  // modules: ['@nuxtjs/vuetify'], 
  // vuetify: { ... opciones si las necesitas ... }
  // NOTA: Por ahora, mantendré tu configuración original para no romper nada,
  // pero te recomiendo investigar el módulo `@nuxtjs/vuetify`.
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

  // ✅ --- CONFIGURACIÓN DE RUNTIME CORREGIDA ---
  runtimeConfig: {
    // Estas claves SOLO son accesibles en el servidor.
    projectApiKey: process.env.PROJECT_API_KEY,

    // Estas claves son seguras para exponer en el navegador.
    public: {
      endpoint: process.env.ENDPOINT,
      project: process.env.PROJECT,
      database: process.env.DATABASE,
      cProducts: process.env.C_PRODUCTS,
      cDeposits: process.env.C_DEPOSITS,
      cQuotes: process.env.C_QUOTES,
      cActionPasswords: process.env.C_ACTION_PASSWORDS,
    },
  },

  // ✅ --- BLOQUE PARA AÑADIR LA TIPOGRAFÍA MODERNA ---
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
