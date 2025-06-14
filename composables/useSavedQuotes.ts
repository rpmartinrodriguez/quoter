import { ref } from 'vue';
import { ID, Query } from 'appwrite';

// Interfaz para tipar los registros guardados. Debe coincidir con tu colección de Appwrite.
export interface ISavedRecord {
  $id: string; // Appwrite añade este campo automáticamente
  clientName: string;
  clientAddress?: string;
  clientPhone?: string;
  type: 'VENTA' | 'COTIZACIÓN';
  quoteDate: string; // Se guarda como un string en formato ISO
  products: string[];
  totalAmount: number;
  depositAmount: number;
  installmentsInfo: string;
}

// Se define el estado fuera de la función para que sea un "singleton",
// es decir, un estado único y compartido por toda la aplicación.
const savedRecords = ref<ISavedRecord[]>([]);
const isLoading = ref(false);

export const useSavedQuotes = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cRecords;

  /**
   * Guarda un nuevo registro (Venta o Cotización) en la base de datos.
   * @param record - El objeto con todos los datos a guardar.
   */
  const saveRecord = async (record: Omit<ISavedRecord, '$id'>) => {
    isLoading.value = true;
    try {
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        record
      );
      console.log("✅ Registro guardado exitosamente!");
      // Después de guardar un nuevo registro, volvemos a cargar la lista completa
      // para que la UI se actualice al instante si está visible.
      await getRecords();
    } catch (error) {
      console.error("❌ Error al guardar el registro:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtiene todos los registros de la base de datos y los guarda en el estado local.
   */
  const getRecords = async () => {
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [
          Query.orderDesc('quoteDate') // Ordena por fecha, los más nuevos primero
        ]
      );
      savedRecords.value = response.documents as ISavedRecord[];
    } catch (error) {
      console.error("❌ Error al obtener los registros:", error);
      savedRecords.value = []; // En caso de error, vaciamos la lista para evitar datos corruptos.
    } finally {
      isLoading.value = false;
    }
  };

  // Se exponen el estado y las funciones para que puedan ser usados en cualquier componente.
  return {
    isLoading,
    savedRecords, // La lista reactiva de registros.
    saveRecord,   // La función para guardar.
    getRecords,   // La función para leer.
  };
};
