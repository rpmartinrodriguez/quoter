import { ID, Query } from "appwrite";

export const useDeposit = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { parseDeposits } = useParse();

  const deposits = ref<Deposit[]>([]);

  const createDeposit = async (d: number) => {
    try {
      await databases.createDocument(
        config.public.database,
        config.public.cDeposits,
        ID.unique(),
        { percentage: Math.round(d) }
      );
      await getDeposits();
    } catch (error) {
      console.log("❌ error al crear depósito", error);
    }
  };

  const updateDeposit = async (id: string, d: number) => {
    try {
      await databases.updateDocument(
        config.public.database,
        config.public.cDeposits,
        id,
        { percentage: Math.round(d) }
      );
      await getDeposits();
    } catch (error) {
      console.log("❌ error al actualizar depósito", error);
    }
  };

  const deleteDeposit = async (id: string) => {
    try {
      await databases.deleteDocument(
        config.public.database,
        config.public.cDeposits,
        id
      );
      await getDeposits();
    } catch (error) {
      console.log("❌ error al borrar depósito", error);
    }
  };

  const getDeposits = async () => {
    try {
      const res = await databases.listDocuments(
        config.public.database,
        config.public.cDeposits,
        [Query.orderDesc("percentage")]
      );
      deposits.value = res.total > 0 ? parseDeposits(res.documents) : [];
    } catch (error) {
      console.log("❌ error al obtener depósitos", error);
    }
  };

  // Inicializa solo si está vacío
  if (deposits.value.length === 0) getDeposits();

  return {
    deposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
  };
};
