import { ref } from 'vue';
import { ID } from 'appwrite';

// --- ESTADO SINGLETON ---
// Se define fuera para que sea un estado global compartido en toda la app.
const quotes = ref<Quote[]>([]);
const isLoading = ref<boolean>(false); // Bandera para controlar el estado de carga.

// Interfaz para el tipado, idealmente estaría en un archivo central `types/index.ts`
interface Quote {
  $id: string;
  quantity: number;
  percentage: number;
}

export const useQuote = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();

  /**
   * Obtiene todas las cuotas desde la base de datos y las guarda en el estado local.
   * Previene ejecuciones múltiples si ya hay una carga en curso.
   */
  const getQuotes = async () => {
    // Si ya estamos cargando, evitamos una nueva llamada.
    if (isLoading.value) return;

    try {
      isLoading.value = true;
      const res = await databases.listDocuments(
        config.public.database,
        config.public.cQuotes
      );

      // Mapeamos los documentos a nuestra interfaz.
      quotes.value = res.documents.map((doc: any) => ({
        quantity: doc.quantity,
        percentage: doc.percentage,
        $id: doc.$id,
      }));
    } catch (error) {
      console.error("❌ Error al obtener cuotas:", error);
      quotes.value = []; // En caso de error, reseteamos el estado.
    } finally {
      isLoading.value = false; // Nos aseguramos de resetear la bandera al finalizar.
    }
  };

  /**
   * Crea una nueva cuota.
   * AHORA ESPERA NÚMEROS DIRECTAMENTE.
   */
  const createQuote = async (quantity: number, percentage: number) => {
    try {
      await databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        {
          quantity, // Se usan los números directamente.
          percentage,
        }
      );
      // Refrescamos la lista para mostrar el nuevo item.
      await getQuotes();
    } catch (error) {
      console.error("❌ Error al crear cuota:", error);
    }
  };

  /**
   * Actualiza una cuota existente.
   * AHORA ESPERA NÚMEROS DIRECTAMENTE.
   */
  const updateQuote = async (id: string, quantity: number, percentage: number) => {
    try {
      await databases.updateDocument(
        config.public.database,
        config.public.cQuotes,
        id,
        {
          quantity,
          percentage,
        }
      );
      // Refrescamos la lista para mostrar los cambios.
      await getQuotes();
    } catch (error) {
      console.error("❌ Error al actualizar cuota:", error);
    }
  };

  /**
   * Elimina una cuota por su ID.
   */
  const deleteQuote = async (id: string) => {
    try {
      await databases.deleteDocument(
        config.public.database,
        config.public.cQuotes,
        id
      );
      // Refrescamos la lista para quitar el item eliminado.
      await getQuotes();
    } catch (error) {
      console.error("❌ Error al eliminar cuota:", error);
    }
  };

  // --- LÓGICA DE CARGA INICIAL ---
  // Se ejecuta solo la primera vez que se llama al composable si los datos no han sido cargados.
  if (quotes.value.length === 0 && !isLoading.value) {
    getQuotes();
  }

  // Se exponen el estado y las funciones para ser usados en los componentes.
  return {
    quotes,
    isLoading, // Exponemos isLoading por si queremos usarlo en la UI (ej: mostrar un spinner).
    getQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
