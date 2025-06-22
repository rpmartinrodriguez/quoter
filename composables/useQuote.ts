import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from 'appwrite';

// ✅ 1. Añadimos 'userId' a la interfaz
interface Quote {
  $id: string;
  quantity: number;
  percentage: number;
  userId: string;
}

// El estado sigue siendo un singleton compartido
const quotes = ref<Quote[]>([]);
const isLoading = ref<boolean>(false);

export const useQuote = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // ✅ 2. Obtenemos el estado del usuario logueado
  const COLLECTION_ID = config.public.cQuotes;

  const getQuotes = async () => {
    if (!user.value) {
      quotes.value = [];
      return;
    }
    isLoading.value = true;
    try {
      const res = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [
          // ✅ 3. Filtramos los datos por el ID del usuario conectado
          Query.equal("userId", user.value.$id),
          Query.orderAsc("quantity")
        ]
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
    if (!user.value) return;
    const userId = user.value.$id;
    try {
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        {
          quantity,
          percentage,
          userId: userId // ✅ 4. "Etiquetamos" el nuevo dato
        },
        // ✅ 5. Le ponemos un "candado" de permisos
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      await getQuotes();
    } catch (error) { 
      console.error("❌ Error al crear cuota:", error);
    }
  };

  const updateQuote = async (id: string, quantity: number, percentage: number) => {
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, { quantity, percentage });
      await getQuotes();
    } catch (error) { 
      console.error("❌ Error al actualizar cuota:", error);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await databases.deleteDocument(config.public.database, COLLECTION_ID, id);
      await getQuotes();
    } catch (error) { 
      console.error("❌ Error al eliminar cuota:", error);
    }
  };

  // ✅ 6. Reemplazamos la carga inicial por un 'watch' reactivo
  watch(user, (newUser) => {
    if (newUser) {
      getQuotes();
    } else {
      quotes.value = [];
    }
  }, { immediate: true });

  return {
    quotes,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
