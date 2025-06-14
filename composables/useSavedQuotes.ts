import { ref } from 'vue';
import { ID, Query } from 'appwrite';

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
  isConverted?: boolean;     // ✅ Nuevo campo opcional
  conversionDate?: string; // ✅ Nuevo campo opcional
}

const savedRecords = ref<ISavedRecord[]>([]);
const isLoading = ref(false);

export const useSavedQuotes = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cRecords;

  const saveRecord = async (record: Omit<ISavedRecord, '$id'>) => {
    // ... (tu función saveRecord no cambia)
  };

  const getRecords = async () => {
    // ... (tu función getRecords no cambia)
  };

  /**
   * ✅ --- NUEVA FUNCIÓN PARA CONVERTIR UNA COTIZACIÓN EN VENTA ---
   * Actualiza un registro existente para cambiar su tipo y marcarlo como convertido.
   */
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
      // Volvemos a cargar todos los registros para que la UI se actualice al instante.
      await getRecords();

    } catch (error) {
      console.error(`❌ Error al convertir el registro ${recordId}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    savedRecords,
    saveRecord,
    getRecords,
    convertQuoteToSale, // ✅ Exponemos la nueva función
  };
};
