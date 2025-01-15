import { AppwriteException } from "appwrite";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { account } = useAppwrite();

  try {
    // Get account information
    const response = await account.get();

    // Set user data in session composable if response is successfull
    const { setUser } = useSession();
    setUser(response);

    return navigateTo("/");
  } catch (error) {}
});
