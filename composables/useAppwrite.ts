import { Client, Databases } from "appwrite";

export const useAppwrite = () => {
  const config = useRuntimeConfig();
  const client = new Client()
    .setEndpoint(config.public.endpoint)
    .setProject(config.public.project);

  const databases = new Databases(client);

  return {
    databases,
  };
};
