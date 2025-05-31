import { ID, Query } from "appwrite";

const data: Product[] = [];

const products = ref<Product[]>([]);
const selected = ref<Product[]>([]);

export const useProducts = (init?: string) => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { parseProducts } = useParse();

  const createProducts = async () => {
    try {
      const promises = data.map((p) => {
        return databases.createDocument(
          config.public.database,
          config.public.cProducts,
          ID.unique(),
          p
        );
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("❌ Error al crear productos:", error);
    }
  };

  const getProducts = async () => {
    try {
      const res = await databases.listDocuments(
        config.public.database,
        config.public.cProducts,
        [Query.limit(500)]
      );

      if (Array.isArray(res.documents) && res.documents.length > 0) {
        const parsed = parseProducts(res.documents);
        products.value = parsed ?? [];
      } else {
        products.value = [];
        selected.value = [];
      }
    } catch (error) {
      console.error("❌ Error al obtener productos:", error);
      products.value = [];
      selected.value = [];
    }
  };

  // ✅ Cargar productos si se pasa el flag de inicio
  if (init === "get") getProducts();

  return {
    getProducts,
    // createProducts,
    list: products,
    selected,
  };
};
