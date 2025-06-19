import { Client, Databases } from "appwrite";

let client: Client | null = null;
let databases: Databases | null = null;

export const useAppwrite = () => {
  const config = useRuntimeConfig();

  if (!client) {
    client = new Client()
      .setEndpoint(config.public.endpoint)
      .setProject(config.public.project);
  }
  if (!databases) {
    databases = new Databases(client);
  }
  return {
    databases,
  };
};
