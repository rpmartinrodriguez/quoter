// plugins/vuetify.ts
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

// Tema Claro Profesional
const miTemaClaro = {
  dark: false,
  colors: {
    background: '#E0E0E0', // ✅ Color de fondo actualizado a un gris más presente
    surface: '#FFFFFF',    // Blanco puro para las tarjetas y superficies
    primary: '#1976D2',    // Un azul clásico y fuerte como color principal
    secondary: '#546E7A',  // Un gris azulado para elementos secundarios
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  }
};

// Tema Oscuro Profesional
const miTemaOscuro = {
  dark: true,
  colors: {
    background: '#121212', // Negro estándar de Material Design para fondos
    surface: '#1E1E1E',    // Un gris oscuro para las tarjetas
    primary: '#BB86FC',    // Un violeta brillante que contrasta bien en modo oscuro
    secondary: '#03DAC6',  // Un teal como color de acento secundario
    error: '#CF6679',
    info: '#2196F3',
    success: '#66BB6A',
    warning: '#FB8C00',
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: false,
    // Configuración completa de íconos
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    // Estilos por defecto para toda la aplicación
    defaults: {
      VBtn: {
        color: 'primary',
        variant: 'flat',
        elevation: 2,
        rounded: 'lg',
      },
      VCard: {
        rounded: 'lg',
        elevation: 1,
      },
      VTextField: {
        variant: 'outlined',
        density: 'compact',
        rounded: 'lg',
      },
       VSelect: {
        variant: 'outlined',
        density: 'compact',
        rounded: 'lg',
      },
       VAutocomplete: {
        variant: 'outlined',
        density: 'compact',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'compact',
        rounded: 'lg',
      }
    },
    // Configuración de temas
    theme: {
      defaultTheme: 'miTemaClaro',
      themes: {
        miTemaClaro,
        miTemaOscuro,
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
