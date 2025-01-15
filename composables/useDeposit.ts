import { ID, Query } from "appwrite";

const deposits = ref<Deposit[]>([]);

export const useDeposit = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { parseDeposits } = useParse();

  const createDeposit = async (d: number) => {
    try {
      const data = {
        percentage: parseInt(d.toString()),
      };
      await databases.createDocument(
        config.public.database,
        config.public.cDeposits,
        ID.unique(),
        data
      );

      await getDeposits();
    } catch (error) {
      console.log("error on create deposit", error);
    }
  };

  const updateDeposit = async (id: string, d: number) => {
    try {
      const data = {
        percentage: parseInt(d.toString()),
      };
      await databases.updateDocument(
        config.public.database,
        config.public.cDeposits,
        id as string,
        data
      );

      await getDeposits();
    } catch (error) {
      console.log("error on create deposit", error);
    }
  };

  const deleteDeposit = async (id: string) => {
    try {
      await databases.deleteDocument(
        config.public.database,
        config.public.cDeposits,
        id as string
      );

      await getDeposits();
    } catch (error) {
      console.log("error on create deposit", error);
    }
  };

  const getDeposits = async () => {
    try {
      const promise = await databases.listDocuments(
        config.public.database,
        config.public.cDeposits,
        [Query.orderDesc("percentage")]
      );

      if (promise.total > 0) deposits.value = parseDeposits(promise.documents);
    } catch (error) {
      console.log("error on get deposits", error);
    }
  };

  // Query deposits if they ar enot in the state already
  if (deposits.value.length === 0) getDeposits();

  return {
    deposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
  };
};
