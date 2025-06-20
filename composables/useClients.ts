// composables/useClients.ts
import { ref } from 'vue';
import { ID, Query } from 'appwrite';

// Interfaz para el objeto Cliente
export interface IClient {
  $id: string;
  clientName: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// Estado singleton para la lista de clientes
const clients = ref<IClient[]>([]);
const isLoading = ref(false);

export const useClients = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  // ¡Importante! Necesitaremos añadir C_CLIENTS a la configuración
  const COLLECTION_ID = config.public.cClients; 

  // Función para obtener todos los clientes
  const getClients = async () => {
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [Query.orderAsc('clientName')] // Ordenados alfabéticamente
      );
      clients.value = response.documents as unknown as IClient[];
    } catch (error) {
      console.error("❌ Error al obtener los clientes:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Función para añadir un nuevo cliente
  const addClient = async (data: Omit<IClient, '$id'>) => {
    try {
      await databases.createDocument(config.public.database, COLLECTION_ID, ID.unique(), data);
      await getClients(); // Refrescamos la lista
    } catch (error) {
      console.error("❌ Error al añadir cliente:", error);
      throw error;
    }
  };
  
  // Función para actualizar un cliente existente
  const updateClient = async (id: string, data: Partial<IClient>) => {
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, data);
      await getClients(); // Refrescamos la lista
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
      throw error;
    }
  };

  // Función para borrar un cliente
  const deleteClient = async (id: string) => {
    try {
      await databases.deleteDocument(config.public.database, COLLECTION_ID, id);
      await getClients(); // Refrescamos la lista
    } catch (error) {
      console.error("❌ Error al borrar cliente:", error);
      throw error;
    }
  };

  // Carga inicial de datos si es necesario
  if (clients.value.length === 0) {
    getClients();
  }

  return {
    clients,
    isLoading,
    getClients,
    addClient,
    updateClient,
    deleteClient,
  };
};
