import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from 'appwrite';

// Se añade 'userId' a la interfaz del registro.
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
  followUpDate?: string;
  followUpNotes?: string;
  userId: string; // Campo para identificar al dueño del registro.
}

const savedRecords = ref<ISavedRecord[]>([]);
const isLoading = ref(false);

export const useSavedQuotes = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // Se obtiene el usuario actual.
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
          // Se filtran los registros por el ID del usuario conectado.
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
    if (!user.value) throw new Error("No hay usuario para guardar el registro.");
    const userId = user.value.$id;
    isLoading.value = true;
    try {
      // Se "etiqueta" el nuevo registro con el userId.
      const docToSave = {
        ...record,
        userId: userId,
      };
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        docToSave,
        // Se le ponen permisos para que solo el dueño pueda acceder.
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
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

  const updateRecord = async (id: string, dataToUpdate: Partial<Omit<ISavedRecord, '$id' | 'userId'>>) => {
    isLoading.value = true;
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, dataToUpdate);
      await getRecords();
    } catch (error) {
      console.error(`❌ Error al actualizar el registro ${id}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  const deleteRecord = async (id: string) => {
    isLoading.value = true;
    try {
      await databases.deleteDocument(config.public.database, COLLECTION_ID, id);
      await getRecords();
    } catch(error) {
      console.error(`❌ Error al eliminar el registro ${id}:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Se reemplaza la carga inicial por un 'watch' reactivo.
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
    updateRecord,
    deleteRecord,
  };
};
