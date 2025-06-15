import { ref } from 'vue';

// Creamos una variable reactiva para guardar el título.
// El valor inicial será el de la página principal.
const pageTitle = ref('Calculadora Principal');

export const usePageTitle = () => {
  // Creamos una función para cambiar el título desde cualquier página.
  const setTitle = (newTitle: string) => {
    pageTitle.value = newTitle;
  };

  // Exponemos la variable y la función.
  return {
    pageTitle,
    setTitle,
  };
};
