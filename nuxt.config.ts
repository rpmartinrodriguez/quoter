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
  runtimeConfig: {
    public: {
      endpoint: process.env.ENDPOINT,
      project: process.env.PROJECT,
      projectApiKey: process.env.PROJECT_API_KEY,
      database: process.env.DATABASE,
      cProducts: process.env.C_PRODUCTS,
      cDeposits: process.env.C_DEPOSITS,
      cQuotes: process.env.C_QUOTES,
      cActionPasswords: process.env.C_ACTION_PASSWORDS,
    },
  },
  ssr: false,
});
