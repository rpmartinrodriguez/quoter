import { Client, Databases } from "appwrite";

// ✅ Instancias únicas para evitar recreación innecesaria
let client: Client | null = null;
let databases: Databases | null = null;

export const useAppwrite = () => {
  const config = useRuntimeConfig();

  if (!client) {
    client = new Client()
      .setEndpoint(config.public.endpoint)
      .setProject(config.public.project);

    // Opcionalmente podés usar API Key si estás en server-side
    // .setKey(config.public.projectApiKey);
  }

  if (!databases) {
    databases = new Databases(client);
  }

  return {
    databases,
  };
};
