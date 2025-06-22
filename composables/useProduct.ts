import { ref } from "vue";
import { ID, Query } from "appwrite";
import readXlsxFile from "read-excel-file";

// --- ESTADO SINGLETON ---
const products = ref<Product[]>([]);
const selected = ref<Product[]>([]);
const isLoading = ref<boolean>(false);

// --- INTERFAZ ---
// Se define la estructura clara de un producto
interface Product {
  $id: string;
  detail: string;
  composition: string;
  price: number;
}

export const useProducts = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cProducts;

  /**
   * Obtiene la lista de todos los productos desde Appwrite.
   */
  const getProducts = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const res = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [Query.limit(5000)] // Aumentamos el límite por si tenés muchos productos
      );
      products.value = res.documents as unknown as Product[];
    } catch (error) {
      console.error("❌ Error al obtener productos:", error);
      products.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Borra todos los productos existentes y los reemplaza con los de un archivo Excel.
   * @param file - El archivo .xlsx seleccionado por el usuario.
   */
  const updateProducts = async (file: File) => {
    isLoading.value = true;
    try {
      // 1. Obtenemos todos los IDs de los productos actuales para borrarlos.
      const currentProducts = await databases.listDocuments(config.public.database, COLLECTION_ID, [Query.limit(5000)]);
      for (const product of currentProducts.documents) {
        await databases.deleteDocument(config.public.database, COLLECTION_ID, product.$id);
      }
      
      // 2. Leemos las filas del nuevo archivo de Excel.
      const rows = await readXlsxFile(file);
      // Omitimos la primera fila (cabecera) con .slice(1)
      for (const row of rows.slice(1)) {
        const productData = {
          detail: row[0],
          composition: row[1],
          price: row[2],
        };
        // 3. Creamos un nuevo documento por cada fila del Excel.
        await databases.createDocument(
          config.public.database,
          COLLECTION_ID,
          ID.unique(),
          productData
        );
      }
      // 4. Refrescamos la lista en la aplicación con los nuevos productos.
      await getProducts();
    } catch (e) {
      console.error("❌ Error al actualizar productos desde Excel", e);
      throw e; // Lanzamos el error para que el componente que llama lo pueda manejar
    } finally {
      isLoading.value = false;
    }
  };


  // Carga inicial de datos si la lista está vacía.
  if (products.value.length === 0 && !isLoading.value) {
    getProducts();
  }

  // Se exponen el estado y las funciones.
  return {
    list: products,
    selected,
    isLoading,
    getProducts,
    updateProducts,
  };
};
