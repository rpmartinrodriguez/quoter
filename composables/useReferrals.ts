import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from "appwrite";

// ✅ Se añade el campo `userId` a la interfaz
export interface IReferral {
  $id: string;
  sponsor: string;
  referralName: string;
  phone?: string;
  occupation?: string;
  peopleCount?: number;
  status: 'Pendiente' | 'Demo' | 'No Acepta' | 'No Contesta';
  loadDate: string;
  userId: string; // <-- NUEVO
}

const referrals = ref<IReferral[]>([]);
const isLoading = ref(false);

export const useReferrals = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // ✅ Obtenemos el usuario actual
  const COLLECTION_ID = config.public.cReferrals;

  const getReferrals = async () => {
    if (!user.value) {
      referrals.value = [];
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
          Query.orderDesc('loadDate')
        ]
      );
      referrals.value = response.documents as unknown as IReferral[];
    } catch (error) {
      console.error("❌ Error al obtener los referidos:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const addReferral = async (data: Omit<IReferral, '$id' | 'loadDate' | 'status' | 'userId'>) => {
    if (!user.value) return; // No se puede crear si no hay usuario
    const userId = user.value.$id;
    try {
      const doc = {
        ...data,
        status: 'Pendiente',
        loadDate: new Date().toISOString(),
        userId: userId, // ✅ AÑADIMOS el userId al guardar
      };
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        doc,
        // ✅ AÑADIMOS permisos para que solo el creador pueda acceder
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

  // ✅ Reemplazamos la carga inicial por un 'watch' que reacciona al estado del usuario
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
  };
};
