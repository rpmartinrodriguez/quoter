import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from 'appwrite';

// ✅ Se añade el campo `userId` a la interfaz
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
  userId: string; // <-- NUEVO
}

const savedRecords = ref<ISavedRecord[]>([]);
const isLoading = ref(false);

export const useSavedQuotes = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // ✅ Obtenemos el usuario actual
  const COLLECTION_ID = config.public.cRecords;

  const getRecords = async () => {
    if (!user.value) {
      savedRecords.value = [];
      return;
    }
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [
          // ✅ FILTRAMOS por el ID del usuario conectado
          Query.equal("userId", user.value.$id),
          Query.orderDesc('$createdAt')
        ]
      );
      savedRecords.value = response.documents as unknown as ISavedRecord[];
    } catch (error) {
      console.error("❌ Error al obtener los registros:", error);
      savedRecords.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const saveRecord = async (record: Omit<ISavedRecord, '$id' | 'userId'>) => {
    if (!user.value) return; // No se puede guardar si no hay usuario
    const userId = user.value.$id;
    
    isLoading.value = true;
    try {
      // ✅ Creamos el documento final añadiendo el userId
      const docToSave = {
        ...record,
        userId: userId,
      };

      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        docToSave,
        // ✅ AÑADIMOS permisos para que solo el creador pueda acceder
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      console.log("✅ Registro guardado exitosamente!");
      await getRecords();
    } catch (error) {
      console.error("❌ Error al guardar el registro:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const convertQuoteToSale = async (recordId: string) => {
    // La seguridad aquí ya está garantizada por los permisos del documento.
    // Un usuario no podrá llamar a esta función sobre un documento que no le pertenece.
    isLoading.value = true;
    try {
      const updateData = {
        type: 'VENTA',
        isConverted: true,
        conversionDate: new Date().toISOString()
      };
      await databases.updateDocument(config.public.database, COLLECTION_ID, recordId, updateData);
      console.log(`✅ Registro ${recordId} convertido a VENTA.`);
      await getRecords();
    } catch (error) {
      console.error(`❌ Error al convertir el registro ${recordId}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ✅ Reemplazamos la carga inicial por un 'watch' que reacciona al estado del usuario
  watch(user, (newUser) => {
    if (newUser) {
      getRecords();
    } else {
      savedRecords.value = [];
    }
  }, { immediate: true });


  return {
    isLoading,
    savedRecords,
    saveRecord,
    getRecords,
    convertQuoteToSale,
  };
};
