import { ref } from 'vue';
import { ID } from 'appwrite';

// Esta interfaz debe coincidir con los atributos de tu colección en Appwrite
export interface ISavedRecord {
  clientName: string;
  clientAddress?: string;
  clientPhone?: string;
  type: 'VENTA' | 'COTIZACIÓN';
  quoteDate: string; // Se enviará como ISO string
  products: string[];
  totalAmount: number;
  depositAmount: number;
  installmentsInfo: string;
}

export const useSavedQuotes = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  
  // Leemos el ID de la colección de registros desde la configuración de Nuxt
  const COLLECTION_ID = config.public.cRecords;

  const isLoading = ref(false);

  /**
   * Guarda un nuevo registro (Venta o Cotización) en la base de datos.
   * @param record - El objeto con todos los datos a guardar.
   */
  const saveRecord = async (record: ISavedRecord) => {
    isLoading.value = true;
    try {
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        record
      );
      
      console.log("✅ Registro guardado exitosamente!");
      // En el futuro, aquí podríamos mostrar una notificación "toast" más profesional.

    } catch (error) {
      console.error("❌ Error al guardar el registro:", error);
      // Aquí también podríamos mostrar una notificación de error al usuario.
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Próximamente agregaremos la función para LEER los registros aquí.

  return {
    isLoading,
    saveRecord,
  };
};
