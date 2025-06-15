// composables/useReferrals.ts
import { ref } from 'vue';
import { ID, Query } from 'appwrite';

// Interfaz para nuestros referidos
export interface IReferral {
  $id: string;
  sponsor: string;
  referralName: string;
  phone?: string;
  occupation?: string;
  peopleCount?: number;
  status: 'Pendiente' | 'Demo' | 'No Acepta' | 'No Contesta';
  loadDate: string;
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
    // ✅ Esta función ahora solo tiene una responsabilidad: crear el documento.
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
    } catch (error) {
      console.error("❌ Error al actualizar el estado del referido:", error);
      throw error;
    }
  };

  // Carga inicial de datos
  if (referrals.value.length === 0 && !isLoading.value) {
    getReferrals();
  }

  return {
    referrals,
    isLoading,
    getReferrals,
    addReferral,
    updateReferralStatus,
  };
};
