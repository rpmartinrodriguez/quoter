// composables/useSnackbar.ts
import { ref } from 'vue';

// Estado global y compartido para la notificación
const show = ref(false);
const text = ref('');
const color = ref('success'); // Color por defecto

export const useSnackbar = () => {
  // Función para mostrar la notificación desde cualquier parte de la app
  const showSnackbar = (options: { text: string; color?: string }) => {
    text.value = options.text;
    color.value = options.color || 'success'; // Si no se especifica color, será verde
    show.value = true;
  };

  return { show, text, color, showSnackbar };
};
