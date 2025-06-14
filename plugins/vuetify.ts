import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

// Definimos nuestra paleta de colores y tema moderno
const miTemaModerno = {
  dark: false,
  colors: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    primary: '#1976D2',
    secondary: '#424242',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    // Configuración de los íconos
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: {
        mdi,
      },
    },
    // Le inyectamos directamente el tema y los defaults
    theme: {
      defaultTheme: 'miTemaModerno',
      themes: {
        miTemaModerno,
      },
    },
    defaults: {
      VCard: { elevation: 2, rounded: 'lg' },
      VBtn: { rounded: 'lg' },
      VTextField: { variant: 'outlined', density: 'compact', rounded: 'lg' },
      VAlert: { rounded: 'lg' },
      VChip: { rounded: 'xl' }
    }
  });

  nuxtApp.vueApp.use(vuetify);
});
