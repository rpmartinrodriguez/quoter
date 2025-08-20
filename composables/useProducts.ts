import { ref } from "vue";
import { ID, Query } from "appwrite";
import readXlsxFile from "read-excel-file";

// Se define la estructura clara de un producto (sin userId)
interface Product {
  $id: string;
  detail: string;
  composition: string;
  price: number;
}

const products = ref<Product[]>([]);
const selected = ref<Product[]>([]);
const isLoading = ref<boolean>(false);

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
        [Query.limit(5000)]
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
   */
  const updateProducts = async (file: File) => {
    isLoading.value = true;
    try {
      const currentProducts = await databases.listDocuments(config.public.database, COLLECTION_ID, [Query.limit(5000)]);
      for (const product of currentProducts.documents) {
        await databases.deleteDocument(config.public.database, COLLECTION_ID, product.$id);
      }
      
      const rows = await readXlsxFile(file);
      for (const row of rows.slice(1)) {
        const productData = {
          detail: row[0],
          composition: row[1],
          price: row[2],
        };
        await databases.createDocument(
          config.public.database,
          COLLECTION_ID,
          ID.unique(),
          productData
        );
      }
      await getProducts();
    } catch (e) {
      console.error("❌ Error al actualizar productos desde Excel", e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  };


  if (products.value.length === 0 && !isLoading.value) {
    getProducts();
  }

  return {
    list: products,
    selected,
    isLoading,
    getProducts,
    updateProducts,
  };
};
