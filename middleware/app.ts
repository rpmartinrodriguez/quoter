import { Query } from "appwrite";

export default defineNuxtRouteMiddleware(async () => {
  try {
    const { user, setUser } = useSession();

    if (!user.value) {
      const { account, databases } = useAppwrite();

      // Get account information
      const response = await account.get();
      setUser(response);

      // Get account sponsor code
      const config = useRuntimeConfig();
      const md = await databases.listDocuments(
        config.public.database,
        config.public.cUsersMetaData,
        [Query.equal("user_id", user.value!.$id)]
      );

      if (md.total > 0) user.value!.sponsor_code = md.documents[0].sponsor_code;

      // Set user data in session composable if response is successfull
    }
  } catch (error) {
    return navigateTo("/auth/sign-in");
  }
});
