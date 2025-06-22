import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from "appwrite";

// ✅ 1. Añadimos 'userId' a la interfaz del dato
interface Deposit {
  $id: string;
  percentage: number;
  userId: string;
}

// El estado sigue siendo un singleton compartido
const deposits = ref<Deposit[]>([]);
const isLoading = ref(false);


export const useDeposit = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // ✅ 2. Obtenemos el estado del usuario logueado
  const COLLECTION_ID = config.public.cDeposits;

  const getDeposits = async () => {
    // Si no hay un usuario conectado, nos aseguramos de que la lista esté vacía y paramos.
    if (!user.value) {
      deposits.value = [];
      return;
    }
    isLoading.value = true;
    try {
      const res = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [
          // ✅ 3. Filtramos los datos para que solo traiga los del usuario actual
          Query.equal("userId", user.value.$id),
          Query.orderDesc("percentage")
        ]
      );
      deposits.value = res.documents as unknown as Deposit[];
    } catch (error) {
      console.log("❌ error al obtener depósitos", error);
      deposits.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createDeposit = async (d: number) => {
    // Si no hay usuario, no podemos crear nada.
    if (!user.value) return;
    const userId = user.value.$id;

    try {
      await databases.createDocument(
        config.public.database,
        COLLECTION_ID,
        ID.unique(),
        { 
          percentage: Math.round(d),
          userId: userId // ✅ 4. "Etiquetamos" el nuevo dato con el ID del usuario
        },
        // ✅ 5. Le ponemos un "candado" para que solo el dueño pueda acceder
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      await getDeposits();
    } catch (error) { 
      console.log("❌ error al crear depósito", error); 
    }
  };

  const updateDeposit = async (id: string, d: number) => {
    // La seguridad aquí ya la manejan los permisos del documento.
    // Un usuario no podrá editar un documento que no es suyo.
    try {
      await databases.updateDocument(config.public.database, COLLECTION_ID, id, { percentage: Math.round(d) });
      await getDeposits();
    } catch (error) { 
      console.log("❌ error al actualizar depósito", error); 
    }
  };

  const deleteDeposit = async (id: string) => {
    try {
      await databases.deleteDocument(config.public.database, COLLECTION_ID, id);
      await getDeposits();
    } catch (error) { 
      console.log("❌ error al borrar depósito", error); 
    }
  };

  // ✅ 6. Reemplazamos la carga inicial por un "observador" reactivo.
  // Este código se asegura de que los datos se carguen/borren cuando el usuario inicia/cierra sesión.
  watch(user, (newUser) => {
    if (newUser) {
      getDeposits();
    } else {
      deposits.value = [];
    }
  }, { immediate: true });

  return {
    deposits,
    isLoading, // Exponemos isLoading por si lo necesitamos
    createDeposit,
    updateDeposit,
    deleteDeposit,
  };
};
