import { ref, watch } from 'vue';
import { ID, Query } from 'appwrite';

// ✅ Se añade el campo para saber si el seguimiento fue completado
export interface IReferral {
  $id: string;
  sponsor: string;
  referralName: string;
  phone?: string;
  occupation?: string;
  peopleCount?: number;
  status: 'Pendiente' | 'Demo' | 'No Acepta' | 'No Contesta';
  loadDate: string;
  nextFollowUp?: string;
  notesFollowUp?: string;
  followUpCompleted?: boolean; // <-- NUEVO
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
      // Al crear, nos aseguramos que 'completado' sea falso por defecto
      const doc = {
        ...data,
        status: 'Pendiente',
        loadDate: new Date().toISOString(),
        followUpCompleted: false,
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
    } catch (error) {
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
      await getReferrals();
    } catch (error) {
      console.error(`❌ Error al actualizar datos del referido ${id}:`, error);
      throw error;
    }
  };

  // ✅ --- INICIO: NUEVA FUNCIÓN PARA MARCAR SEGUIMIENTO COMO HECHO ---
  const markFollowUpAsDone = async (id: string) => {
    try {
      await databases.updateDocument(
        config.public.database,
        COLLECTION_ID,
        id,
        { followUpCompleted: true }
      );
      // Refrescamos la lista para que el cambio se refleje en toda la app
      await getReferrals();
    } catch (error) {
      console.error(`❌ Error al completar el seguimiento del referido ${id}:`, error);
      throw error;
    }
  };
  // ✅ --- FIN: NUEVA FUNCIÓN ---

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
    markFollowUpAsDone, // ✅ Se exporta la nueva función
  };
};
