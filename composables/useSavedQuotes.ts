import { ref } from 'vue';
import { ID, Query } from 'appwrite';

// Interfaz para tipar los registros guardados
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

// Estado singleton compartido por toda la aplicación
const savedRecords = ref<ISavedRecord[]>([]);
const isLoading = ref(false);

export const useSavedQuotes = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cRecords;

  // --- Función para OBTENER registros ---
  const getRecords = async () => {
    // Evita cargas múltiples si ya hay una en curso
    if (isLoading.value) return; 
    
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [Query.orderDesc('quoteDate')]
      );
      savedRecords.value = response.documents as ISavedRecord[];
    } catch (error) {
      console.error("❌ Error al obtener los registros:", error);
      savedRecords.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // --- Función para GUARDAR un registro ---
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
      await getRecords(); // Recargamos la lista después de guardar
    } catch (error) {
      console.error("❌ Error al guardar el registro:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // --- Función para CONVERTIR cotización a venta ---
  const convertQuoteToSale = async (recordId: string) => {
    isLoading.value = true;
    try {
      const updateData = {
        type: 'VENTA',
        isConverted: true,
        conversionDate: new Date().toISOString()
      };
      
      await databases.updateDocument(
        config.public.database,
        COLLECTION_ID,
        recordId,
        updateData
      );
      
      console.log(`✅ Registro ${recordId} convertido a VENTA.`);
      await getRecords(); // Recargamos la lista después de convertir

    } catch (error) {
      console.error(`❌ Error al convertir el registro ${recordId}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };


  // ✅ --- LÓGICA DE AUTO-INICIALIZACIÓN --- ✅
  // Si la lista de registros está vacía y no se está cargando,
  // se llama a getRecords() automáticamente.
  // Esto asegura que los datos estén disponibles la primera vez que se use el composable.
  if (savedRecords.value.length === 0 && !isLoading.value) {
    getRecords();
  }


  // Se exponen todas las funcionalidades
  return {
    isLoading,
    savedRecords,
    saveRecord,
    getRecords,
    convertQuoteToSale,
  };
};
