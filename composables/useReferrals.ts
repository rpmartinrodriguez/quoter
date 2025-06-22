import { ref, watch } from 'vue';
import { ID, Query } from 'appwrite';

// ✅ Se añaden los nuevos campos opcionales para el seguimiento
export interface IReferral {
  $id: string;
  sponsor: string;
  referralName: string;
  phone?: string;
  occupation?: string;
  peopleCount?: number;
  status: 'Pendiente' | 'Demo' | 'No Acepta' | 'No Contesta';
  loadDate: string;
  followUpDate?: string;   // <-- NUEVO
  followUpNotes?: string; // <-- NUEVO
}

const referrals = ref<IReferral[]>([]);
const isLoading = ref(false);

export const useReferrals = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cReferrals;

  const getReferrals = async () => {
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(config.public.database, COLLECTION_ID, [
        Query.orderDesc('loadDate')
      ]);
      referrals.value = response.documents as unknown as IReferral[];
    } catch (error) {
      console.error("❌ Error al obtener los referidos:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const addReferral = async (data: Omit<IReferral, '$id' | 'loadDate' | 'status'>) => {
    try {
      const doc = {
        ...data,
        status: 'Pendiente',
        loadDate: new Date().toISOString(),
      };
      await databases.createDocument(config.public.database, COLLECTION_ID, ID.unique(), doc);
    } catch (error) {
      console.error("❌ Error al añadir referido:", error);
      throw error;
    }
  };
  
  const updateReferralStatus = async (id: string, status: IReferral['status']) => {
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, { status });
      const index = referrals.value.findIndex(r => r.$id === id);
      if (index !== -1) {
        referrals.value[index].status = status;
      }
    } catch (error)
    {
      console.error("❌ Error al actualizar el estado del referido:", error);
      throw error;
    }
  };

  const updateReferralData = async (id: string, dataToUpdate: Partial<IReferral>) => {
    try {
      await databases.updateDocument(
        config.public.database,
        COLLECTION_ID,
        id,
        dataToUpdate
      );
      // Después de actualizar, refrescamos la lista para ver los cambios
      await getReferrals();
    } catch (error) {
      console.error(`❌ Error al actualizar datos del referido ${id}:`, error);
      throw error;
    }
  };

  if (referrals.value.length === 0 && !isLoading.value) {
    getReferrals();
  }

  return { 
    referrals, 
    isLoading, 
    getReferrals, 
    addReferral, 
    updateReferralStatus,
    updateReferralData,
  };
};
