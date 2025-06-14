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
   * Incluye alertas para depuración en dispositivos móviles.
   * @param record - El objeto con todos los datos a guardar.
   */
  const saveRecord = async (record: ISavedRecord) => {
    isLoading.value = true;
    try {
      // Intentamos crear el documento en la colección de Appwrite
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        record
      );

      console.log("✅ Registro guardado exitosamente!");
      // Si todo sale bien, mostramos una alerta de éxito
      alert("¡ÉXITO! El registro parece haberse guardado. Por favor, revisá tu base de datos en Appwrite para confirmar.");

    } catch (error: any) { // Añadimos ': any' para poder acceder a las propiedades del error
      console.error("❌ Error al guardar el registro:", error);
      
      // --- ¡ESTA ES LA ALERTA CLAVE PARA DIAGNOSTICAR! ---
      // Si algo falla, nos mostrará el error exacto en pantalla.
      alert(`ERROR AL GUARDAR:\n\n${error.message}`);
      
      throw error; // Mantenemos el error para que la consola también lo registre si es posible
    } finally {
      isLoading.value = false; // Nos aseguramos de que el estado de carga se desactive siempre
    }
  };
  
  // Aquí, en el futuro, agregaremos la función para LEER los registros: getRecords()

  return {
    isLoading,
    saveRecord,
  };
};
