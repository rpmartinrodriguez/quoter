import { Client, Databases, Account } from "appwrite";

// Instancias únicas para toda la aplicación
let client: Client | null = null;
let databases: Databases | null = null;
let account: Account | null = null;

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

  if (!account) {
    account = new Account(client);
  }

  // ✅ Es crucial que retorne tanto 'databases' como 'account'
  return {
    databases,
    account,
  };
};
