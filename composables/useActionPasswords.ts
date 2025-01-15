import { Query } from "appwrite";

export const useActionPasswords = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();

  const checkPassword = async (t: string, p: string) => {
    try {
      const promise = await databases.listDocuments(
        config.public.database,
        config.public.cActionPasswords,
        [Query.equal("type", t), Query.equal("password", p)]
      );

      const res = promise.total === 0 ? 404 : 201;

      return res;
    } catch (error) {
      console.log("error on uploads password check", error);
    }
  };
  return {
    checkPassword,
  };
};
