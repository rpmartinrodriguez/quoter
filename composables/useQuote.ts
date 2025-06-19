import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from "appwrite";

// ✅ Se define el estado fuera para que sea un singleton compartido
const quotes = ref<Quote[]>([]);
const isLoading = ref<boolean>(false);

// ✅ Actualizamos la interfaz para incluir el userId
interface Quote {
  $id: string;
  quantity: number;
  percentage: number;
  userId: string;
}

export const useQuote = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // ✅ Obtenemos el usuario actual
  const COLLECTION_ID = config.public.cQuotes;

  const getQuotes = async () => {
    // Si no hay un usuario conectado, vaciamos la lista y no hacemos nada más.
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
          // ✅ FILTRAMOS por el ID del usuario conectado
          Query.equal("userId", user.value.$id),
          Query.orderDesc("quantity")
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
    if (!user.value) return; // No se puede crear si no hay usuario
    const userId = user.value.$id;

    try {
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        { 
          quantity,
          percentage,
          userId: userId // ✅ AÑADIMOS el userId al guardar
        },
        // ✅ AÑADIMOS permisos para que solo el creador pueda leer/modificar
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
      await databases.updateDocument(
        config.public.database,
        COLLECTION_ID,
        id,
        { quantity, percentage }
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
        COLLECTION_ID,
        id
      );
      await getQuotes();
    } catch (error) {
      console.error("❌ Error al eliminar cuota:", error);
    }
  };

  // ✅ Reemplazamos la carga inicial por un 'watch' que reacciona al estado del usuario
  watch(user, (newUser) => {
    if (newUser) {
      // Si un usuario inicia sesión, cargamos sus cuotas
      getQuotes();
    } else {
      // Si el usuario cierra sesión, vaciamos la lista
      quotes.value = [];
    }
  }, { immediate: true }); // `immediate` hace que se ejecute una vez al principio


  return {
    quotes,
    isLoading,
    getQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
