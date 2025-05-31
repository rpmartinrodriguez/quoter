import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: "mdi", // ✅ necesario para íconos como mdi-check, mdi-delete
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
