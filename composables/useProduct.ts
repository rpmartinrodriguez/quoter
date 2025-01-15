import { ID, Query } from "appwrite";

const data: IProduct[] = [];

const products = ref<IProduct[]>([]);
const selected = ref<IProduct[]>([]);

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
      console.log("error on create products", error);
    }
  };

  const getProducts = async () => {
    try {
      const res = await databases.listDocuments(
        config.public.database,
        config.public.cProducts,
        [Query.limit(500)]
      );

      if (res.total > 0) products.value = parseProducts(res.documents);
    } catch (error) {
      console.log("error on get products", error);
    }
  };

  if (init === "get") getProducts();

  return {
    getProducts,
    list: products,
    selected,
  };
};
