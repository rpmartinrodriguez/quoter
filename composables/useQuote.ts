import { ID } from "appwrite";

const quotes = ref<Quote[]>([]);

export const useQuote = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();

  const getQuotes = async () => {
    try {
      const res = await databases.listDocuments(
        config.public.database,
        config.public.cQuotes
      );

      quotes.value = res.documents.map((doc) => ({
        quantity: doc.quantity,
        percentage: doc.percentage,
        $id: doc.$id,
      }));
    } catch (error) {
      console.error("❌ Error al obtener cuotas:", error);
      quotes.value = [];
    }
  };

  const createQuote = async (q: string, p: string) => {
    try {
      const quantity = parseInt(q);
      const percentage = parseFloat(p);

      if (isNaN(quantity) || isNaN(percentage)) return;

      await databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        {
          quantity,
          percentage,
        }
      );

      await getQuotes();
    } catch (error) {
      console.error("❌ Error al crear cuota:", error);
    }
  };

  const updateQuote = async (id: string, q: string, p: string) => {
    try {
      const quantity = parseInt(q);
      const percentage = parseFloat(p);

      if (isNaN(quantity) || isNaN(percentage)) return;

      await databases.updateDocument(
        config.public.database,
        config.public.cQuotes,
        id,
        {
          quantity,
          percentage,
        }
      );

      await getQuotes();
    } catch (error) {
      console.error("❌ Error al actualizar cuota:", error);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await databases.deleteDocument(
        config.public.database,
        config.public.cQuotes,
        id
      );

      await getQuotes();
    } catch (error) {
      console.error("❌ Error al eliminar cuota:", error);
    }
  };

  // ✅ Carga inicial si está vacío
  if (!quotes.value || quotes.value.length === 0) {
    getQuotes();
  }

  return {
    quotes,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
