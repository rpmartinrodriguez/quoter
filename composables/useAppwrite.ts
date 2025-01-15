import { Account, Client, Databases } from "appwrite";

export const useAppwrite = () => {
  const config = useRuntimeConfig();
  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project);

  const account = new Account(client);
  const databases = new Databases(client);

  return {
    databases,
    account,
  };
};
