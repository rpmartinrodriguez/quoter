import { ref } from 'vue';
import { ID, Query } from 'appwrite';

const quotes = ref<Quote[]>([]);
const isLoading = ref<boolean>(false);

interface Quote {
  $id: string;
  quantity: number;
  percentage: number;
}

export const useQuote = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cQuotes;

  const getQuotes = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const res = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [Query.orderAsc("quantity")]
      );
      quotes.value = res.documents as unknown as Quote[];
    } catch (error) {
      console.error("❌ Error al obtener cuotas:", error);
      quotes.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createQuote = async (quantity: number, percentage: number) => {
    try {
      await databases.createDocument(config.public.database, COLLECTION_ID, ID.unique(), { quantity, percentage });
      await getQuotes();
    } catch (error) { console.error("❌ Error al crear cuota:", error); }
  };

  const updateQuote = async (id: string, quantity: number, percentage: number) => {
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, { quantity, percentage });
      await getQuotes();
    } catch (error) { console.error("❌ Error al actualizar cuota:", error); }
  };

  const deleteQuote = async (id: string) => {
    try {
      await databases.deleteDocument(config.public.database, COLLECTION_ID, id);
      await getQuotes();
    } catch (error) { console.error("❌ Error al eliminar cuota:", error); }
  };

  if (quotes.value.length === 0 && !isLoading.value) {
    getQuotes();
  }

  return {
    quotes,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
