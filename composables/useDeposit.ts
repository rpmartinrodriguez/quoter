import { ref } from 'vue';
import { ID, Query } from "appwrite";

// ✅ Se quita 'userId' de la interfaz. El depósito ya no pertenece a un usuario.
interface Deposit {
  $id: string;
  percentage: number;
}

// El estado es un singleton compartido por todos los usuarios.
const deposits = ref<Deposit[]>([]);
const isLoading = ref(false);

export const useDeposit = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  // ✅ Se elimina la dependencia de 'useAuth()'.
  const COLLECTION_ID = config.public.cDeposits;

  const getDeposits = async () => {
    isLoading.value = true;
    try {
      const res = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [
          // ✅ La consulta ya no filtra por usuario, trae todos los depósitos.
          Query.orderDesc("percentage")
        ]
      );
      deposits.value = res.documents as unknown as Deposit[];
    } catch (error) {
      console.log("❌ error al obtener depósitos", error);
      deposits.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createDeposit = async (d: number) => {
    try {
      // ✅ Al crear, ya no se añade 'userId' ni permisos especiales.
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        { percentage: Math.round(d) }
      );
      await getDeposits();
    } catch (error) { 
      console.log("❌ error al crear depósito", error); 
      throw error;
    }
  };

  const updateDeposit = async (id: string, d: number) => {
    try {
      await databases.updateDocument(
        config.public.database,
        COLLECTION_ID,
        id,
        { percentage: Math.round(d) }
      );
      await getDeposits();
    } catch (error) { 
      console.log("❌ error al actualizar depósito", error); 
      throw error;
    }
  };

  const deleteDeposit = async (id: string) => {
    try {
      await databases.deleteDocument(
        config.public.database,
        COLLECTION_ID,
        id
      );
      await getDeposits();
    } catch (error) { 
      console.log("❌ error al borrar depósito", error); 
      throw error;
    }
  };

  // ✅ Se vuelve al inicializador simple, ya que no depende del estado del usuario.
  if (deposits.value.length === 0 && !isLoading.value) {
    getDeposits();
  }

  return {
    deposits,
    isLoading,
    createDeposit,
    updateDeposit,
    deleteDeposit,
    getDeposits,
  };
};
