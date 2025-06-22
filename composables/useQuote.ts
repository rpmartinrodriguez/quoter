import { ref } from 'vue';
import { ID, Query } from 'appwrite';

// ✅ La interfaz vuelve a ser simple, sin userId.
interface Quote {
  $id: string;
  quantity: number;
  percentage: number;
}

// El estado es un singleton compartido por todos.
const quotes = ref<Quote[]>([]);
const isLoading = ref<boolean>(false);

export const useQuote = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  // ✅ Ya no necesita a useAuth().

  const getQuotes = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      // ✅ La consulta ya no filtra por usuario, trae todos los documentos.
      const res = await databases.listDocuments(
        config.public.database,
        config.public.cQuotes,
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
      // ✅ Al crear, ya no añade userId ni permisos de usuario. Es un dato público.
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        { quantity, percentage }
      );
      await getQuotes();
    } catch (error) { 
      console.error("❌ Error al crear cuota:", error);
      throw error;
    }
  };

  const updateQuote = async (id: string, quantity: number, percentage: number) => {
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, { quantity, percentage });
      await getQuotes();
    } catch (error) { 
      console.error("❌ Error al actualizar cuota:", error);
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await databases.deleteDocument(config.public.database, COLLECTION_ID, id);
      await getQuotes();
    } catch (error) { 
      console.error("❌ Error al eliminar cuota:", error);
      throw error;
    }
  };

  // ✅ Volvemos al inicializador simple, ya que no depende del estado del usuario.
  if (quotes.value.length === 0 && !isLoading.value) {
    getQuotes();
  }

  return {
    quotes,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
    getQuotes,
  };
};
