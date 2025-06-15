// plugins/vuetify.ts
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

const miTemaClaro = {
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

// ✅ Se añade la definición del tema oscuro
const miTemaOscuro = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#2196F3', // Un azul más brillante para el modo oscuro
    secondary: '#B0BEC5',
    error: '#CF6679',
    info: '#2196F3',
    success: '#66BB6A',
    warning: '#FB8C00',
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    icons: { /* ... (sin cambios) ... */ },
    // ✅ Se añaden ambos temas a la configuración
    theme: {
      defaultTheme: 'miTemaClaro', // Empezamos con el tema claro
      themes: {
        miTemaClaro,
        miTemaOscuro, // Registramos el tema oscuro
      },
    },
    defaults: { /* ... (sin cambios) ... */ }
  });

  nuxtApp.vueApp.use(vuetify);
});
