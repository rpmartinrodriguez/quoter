import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi"; // Importamos los aliases para los íconos

// ✅ 1. Definimos nuestra paleta de colores y tema moderno
const miTemaModerno = {
  dark: false, // Tema claro
  colors: {
    background: '#F5F7FA', // Un gris azulado muy claro para el fondo general
    surface: '#FFFFFF',    // El color de la superficie de las tarjetas, etc.
    primary: '#1976D2',    // Azul principal para botones y acentos
    secondary: '#424242',  // Un gris oscuro para elementos secundarios
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    // Mantenemos y completamos tu configuración de íconos
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: {
        mdi,
      },
    },

    // ✅ 2. Aplicamos nuestro tema personalizado
    theme: {
      defaultTheme: 'miTemaModerno',
      themes: {
        miTemaModerno,
      },
    },

    // ✅ 3. Definimos estilos por defecto para todos los componentes
    defaults: {
      VCard: {
        elevation: 2,
        rounded: 'lg', // Bordes más redondeados para las tarjetas
      },
      VBtn: {
        rounded: 'lg', // Bordes redondeados para los botones
      },
      VTextField: {
        variant: 'outlined',
        density: 'compact',
        rounded: 'lg',
      },
      VAlert: {
        rounded: 'lg',
      },
      VChip: {
        rounded: 'xl', // Chips bien redondeados
      }
    }
  });

  nuxtApp.vueApp.use(vuetify);
});
