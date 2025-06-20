import { ref, watch } from 'vue';
import { ID, Query } from 'appwrite';

// La interfaz no necesita cambios para esta funcionalidad
export interface ISavedRecord {
  $id: string;
  clientName: string;
  clientAddress?: string;
  clientPhone?: string;
  type: 'VENTA' | 'COTIZACIÓN';
  quoteDate: string;
  products: string[];
  totalAmount: number;
  depositAmount: number;
  installmentsInfo: string;
  isConverted?: boolean;
  conversionDate?: string;
}

const savedRecords = ref<ISavedRecord[]>([]);
const isLoading = ref(false);

export const useSavedQuotes = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cRecords;

  const getRecords = async () => {
    if (isLoading.value) return; 
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      savedRecords.value = response.documents as unknown as ISavedRecord[];
    } catch (error) {
      console.error("❌ Error al obtener los registros:", error);
      savedRecords.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const saveRecord = async (record: Omit<ISavedRecord, '$id'>) => {
    isLoading.value = true;
    try {
      await databases.createDocument(config.public.database, COLLECTION_ID, ID.unique(), record);
      await getRecords();
    } catch (error) {
      console.error("❌ Error al guardar el registro:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const convertQuoteToSale = async (recordId: string) => {
    isLoading.value = true;
    try {
      const updateData = { type: 'VENTA', isConverted: true, conversionDate: new Date().toISOString() };
      await databases.updateDocument(config.public.database, COLLECTION_ID, recordId, updateData);
      await getRecords();
    } catch (error) {
      console.error(`❌ Error al convertir el registro ${recordId}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ --- INICIO: NUEVA FUNCIÓN PARA EDITAR UN REGISTRO ---
  const updateRecord = async (id: string, dataToUpdate: Partial<Omit<ISavedRecord, '$id'>>) => {
    isLoading.value = true;
    try {
      await databases.updateDocument(
        config.public.database,
        COLLECTION_ID,
        id,
        dataToUpdate
      );
      // Después de actualizar, refrescamos la lista para ver los cambios
      await getRecords();
    } catch (error) {
      console.error(`❌ Error al actualizar el registro ${id}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  // ✅ --- FIN: NUEVA FUNCIÓN ---

  if (savedRecords.value.length === 0 && !isLoading.value) {
    getRecords();
  }

  return { 
    isLoading, 
    savedRecords, 
    saveRecord, 
    getRecords, 
    convertQuoteToSale,
    updateRecord, // ✅ Se exporta la nueva función
  };
};
