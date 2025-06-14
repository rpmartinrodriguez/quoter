// composables/useSavedQuotes.ts

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
  const COLLECTION_ID = config.public.cRecords; // Necesitaremos añadir esta variable a .env y nuxt.config

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
      // Opcional: podrías mostrar una notificación de éxito aquí
      console.log("✅ Registro guardado exitosamente!");
    } catch (error) {
      console.error("❌ Error al guardar el registro:", error);
      // Opcional: podrías mostrar una notificación de error aquí
      throw error; // Propagamos el error por si la UI quiere manejarlo
    } finally {
      isLoading.value = false;
    }
  };
  
  // Aquí, en el futuro, agregaremos la función para LEER los registros: getRecords()

  return {
    isLoading,
    saveRecord,
  };
};
