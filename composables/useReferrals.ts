import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from 'appwrite';

// ✅ Se añade 'userId' a la interfaz
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
  followUpCompleted?: boolean;
  userId: string; // <-- NUEVO
}

const referrals = ref<IReferral[]>([]);
const isLoading = ref(false);

export const useReferrals = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // ✅ Se obtiene el usuario actual
  const COLLECTION_ID = config.public.cReferrals;

  const getReferrals = async () => {
    if (!user.value) {
      referrals.value = [];
      return;
    }
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(config.public.database, COLLECTION_ID, [
        // ✅ Se filtra por el ID del usuario conectado
        Query.equal("userId", user.value.$id),
        Query.orderDesc('loadDate')
      ]);
      referrals.value = response.documents as unknown as IReferral[];
    } catch (error) {
      console.error("❌ Error al obtener los referidos:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const addReferral = async (data: Omit<IReferral, '$id' | 'loadDate' | 'status' | 'userId'>) => {
    if (!user.value) throw new Error("No hay un usuario autenticado para asignar el referido.");
    const userId = user.value.$id;
    try {
      const doc = {
        ...data,
        status: 'Pendiente',
        loadDate: new Date().toISOString(),
        followUpCompleted: false,
        userId: userId, // ✅ Se "etiqueta" el nuevo referido
      };
      await databases.createDocument(
        config.public.database, 
        COLLECTION_ID, 
        ID.unique(), 
        doc,
        // ✅ Se le ponen permisos para que solo el dueño pueda acceder
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
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
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, dataToUpdate);
      await getReferrals();
    } catch (error) {
      console.error(`❌ Error al actualizar datos del referido ${id}:`, error);
      throw error;
    }
  };

  const markFollowUpAsDone = async (id: string) => {
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, { followUpCompleted: true });
      await getReferrals();
    } catch (error) {
      console.error(`❌ Error al completar el seguimiento del referido ${id}:`, error);
      throw error;
    }
  };

  // ✅ Se reemplaza la carga inicial por un 'watch' reactivo al estado del usuario
  watch(user, (newUser) => {
    if (newUser) {
      getReferrals();
    } else {
      referrals.value = [];
    }
  }, { immediate: true });

  return { 
    referrals, 
    isLoading, 
    getReferrals, 
    addReferral, 
    updateReferralStatus,
    updateReferralData,
    markFollowUpAsDone,
  };
};
