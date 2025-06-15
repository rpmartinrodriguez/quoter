// composables/useSnackbar.ts
import { ref } from 'vue';

const show = ref(false);
const text = ref('');
const color = ref('success');

export const useSnackbar = () => {
  const showSnackbar = (options: { text: string; color?: string }) => {
    text.value = options.text;
    color.value = options.color || 'success';
    show.value = true;
  };

  return { show, text, color, showSnackbar };
};
