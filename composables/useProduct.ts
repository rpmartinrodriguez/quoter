import { ref } from "vue";
import { ID, Query } from "appwrite";

// --- ESTADO SINGLETON ---
// Estado compartido para toda la aplicación.
const products = ref<Product[]>([]);
const selected = ref<Product[]>([]);
const isLoading = ref<boolean>(false);

// Interfaz para el tipado, idealmente en `types/index.ts`
interface Product {
  // Define aquí las propiedades de tu producto: $id, detail, price, etc.
  [key: string]: any; 
}

// El parámetro "init" se elimina, ya no es necesario.
export const useProducts = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { parseProducts } = useParse(); // Asumo que este composable existe.

  /**
   * Obtiene la lista de productos desde Appwrite.
   * Previene ejecuciones concurrentes con la bandera isLoading.
   */
  const getProducts = async () => {
    if (isLoading.value) return;

    try {
      isLoading.value = true;
      const res = await databases.listDocuments(
        config.public.database,
        config.public.cProducts,
        [Query.limit(500)]
      );

      if (Array.isArray(res.documents) && res.documents.length > 0) {
        const parsed = parseProducts(res.documents);
        products.value = parsed ?? [];
      } else {
        // Si no vienen productos, reseteamos ambos estados.
        products.value = [];
        selected.value = [];
      }
    } catch (error) {
      console.error("❌ Error al obtener productos:", error);
      // En caso de error, también reseteamos ambos estados.
      products.value = [];
      selected.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // --- LÓGICA DE CARGA INICIAL ---
  // Se autoejecuta si la lista de productos está vacía y no hay una carga en curso.
  // Esto asegura que cualquier componente que llame a useProducts tenga los datos disponibles.
  if (products.value.length === 0 && !isLoading.value) {
    getProducts();
  }

  // Se exponen el estado y las funciones.
  return {
    getProducts, // La mantenemos por si se necesita recargar la lista manualmente.
    list: products,
    selected,
    isLoading, // Exponemos isLoading para la UI.
  };
};

/*
* NOTA SOBRE `createProducts`:
* La función `createProducts` y la constante `data` no estaban siendo exportadas
* ni utilizadas dentro del composable, por lo que las he omitido en esta versión final.
* Si las necesitás para poblar la base de datos, deberías exportarlas en el `return`.
*/
