import { ID, Query } from "appwrite";

const deposits = ref<IDeposit[]>([]);

export const useDeposit = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { parseDeposit } = useParse();
  const { $id } = useSession();

  const getDeposits = async () => {
    try {
      const promise = await databases.listDocuments(
        config.public.database,
        config.public.cDeposits,
        [Query.equal("user_id", $id.value!), Query.orderDesc("percentage")]
      );

      if (promise.total > 0) deposits.value = parseDeposit(promise.documents);
    } catch (error) {
      console.log("error on get deposits", error);
    }
  };

  const createDeposit = async (p: number) => {
    try {
      await databases.createDocument(
        config.public.database,
        config.public.cDeposits,
        ID.unique(),
        {
          user_id: $id.value,
          percentage: parseFloat(p.toString()),
        }
      );
      await getDeposits();
    } catch (error) {
      console.log("error on create deposit", error);
    }
  };

  const updateDeposit = async (id: string, p: number) => {
    try {
      await databases.updateDocument(
        config.public.database,
        config.public.cDeposits,
        id,
        {
          percentage: parseFloat(p.toString()),
        }
      );
      await getDeposits();
    } catch (error) {
      console.log("error on update deposits", error);
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
      console.log("error on delete deposits", error);
    }
  };

  // Get quotes if state is empty
  if (deposits.value.length === 0) getDeposits();

  return {
    deposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
  };
};
