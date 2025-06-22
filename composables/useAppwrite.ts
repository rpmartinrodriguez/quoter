// composables/useAppwrite.ts
import { Client, Databases, Account } from "appwrite";

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
  return { databases, account };
};
