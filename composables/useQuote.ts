import { ID, Query } from "appwrite";

const quotes = ref<IQuote[]>([]);

export const useQuote = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { parseQuotes } = useParse();
  const { $id } = useSession();

  const getQuotes = async () => {
    try {
      const promise = await databases.listDocuments(
        config.public.database,
        config.public.cQuotes,
        [Query.equal("user_id", $id.value!), Query.orderDesc("quantity")]
      );

      if (promise.total > 0) quotes.value = parseQuotes(promise.documents);
    } catch (error) {
      console.log("error on get quotes", error);
    }
  };

  const createQuote = async (q: string, p: string) => {
    try {
      await databases.createDocument(
        config.public.database,
        config.public.cQuotes,
        ID.unique(),
        {
          quantity: parseInt(q),
          percentage: parseFloat(p),
        }
      );
      await getQuotes();
    } catch (error) {
      console.log("error on create quotes", error);
    }
  };

  const updateQuote = async (id: string, q: string, p: string) => {
    try {
      await databases.updateDocument(
        config.public.database,
        config.public.cQuotes,
        id,
        {
          quantity: parseInt(q),
          percentage: parseFloat(p),
        }
      );
      await getQuotes();
    } catch (error) {
      console.log("error on update quotes", error);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await databases.deleteDocument(
        config.public.database,
        config.public.cQuotes,
        id
      );
      await getQuotes();
    } catch (error) {
      console.log("error on delete quotes", error);
    }
  };

  // Get quotes if state is empty
  if (quotes.value.length === 0) getQuotes();

  return {
    quotes,
    createQuote,
    updateQuote,
    deleteQuote,
  };
};
