import { ref } from 'vue';
import { ID, Query } from "appwrite";

const deposits = ref<Deposit[]>([]);
const isLoading = ref(false);

interface Deposit {
  $id: string;
  percentage: number;
}

export const useDeposit = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const COLLECTION_ID = config.public.cDeposits;

  const getDeposits = async () => {
    isLoading.value = true;
    try {
      const res = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [Query.orderDesc("percentage")]
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
      await databases.createDocument(config.public.database, COLLECTION_ID, ID.unique(), { percentage: Math.round(d) });
      await getDeposits();
    } catch (error) { console.log("❌ error al crear depósito", error); }
  };

  const updateDeposit = async (id: string, d: number) => {
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, { percentage: Math.round(d) });
      await getDeposits();
    } catch (error) { console.log("❌ error al actualizar depósito", error); }
  };

  const deleteDeposit = async (id: string) => {
    try {
      await databases.deleteDocument(config.public.database, COLLECTION_ID, id);
      await getDeposits();
    } catch (error) { console.log("❌ error al borrar depósito", error); }
  };

  if (deposits.value.length === 0) {
    getDeposits();
  }

  return {
    deposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
  };
};
