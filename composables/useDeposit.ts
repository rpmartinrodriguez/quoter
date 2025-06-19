import { ref } from 'vue';
import { ID, Query, Permission, Role } from "appwrite";

// ✅ Se define el estado fuera para que sea un singleton compartido
const deposits = ref<Deposit[]>([]);
const isLoading = ref(false);

// ✅ Actualizamos la interfaz para incluir el userId
interface Deposit {
  $id: string;
  percentage: number;
  userId: string;
}

export const useDeposit = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth(); // ✅ Obtenemos el usuario actual
  const COLLECTION_ID = config.public.cDeposits;

  const getDeposits = async () => {
    // Si no hay un usuario conectado, vaciamos la lista y no hacemos nada más.
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
          // ✅ FILTRAMOS por el ID del usuario conectado
          Query.equal("userId", user.value.$id),
          Query.orderDesc("percentage")
        ]
      );
      // Ya no necesitamos `parseDeposits` si los datos coinciden
      deposits.value = res.documents as unknown as Deposit[];
    } catch (error) {
      console.log("❌ error al obtener depósitos", error);
      deposits.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createDeposit = async (d: number) => {
    if (!user.value) return; // No se puede crear si no hay usuario
    const userId = user.value.$id;

    try {
      await databases.createDocument(
        config.public.database,
        config.public.cDeposits,
        ID.unique(),
        { 
          percentage: Math.round(d),
          userId: userId // ✅ AÑADIMOS el userId al guardar
        },
        // ✅ AÑADIMOS permisos para que solo el creador pueda leer/modificar
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
    // La seguridad ya está manejada por los permisos a nivel de documento.
    // Un usuario no podrá actualizar un depósito que no le pertenece.
    try {
      await databases.updateDocument(
        config.public.database,
        config.public.cDeposits,
        id,
        { percentage: Math.round(d) }
      );
      await getDeposits();
    } catch (error) {
      console.log("❌ error al actualizar depósito", error);
    }
  };

  const deleteDeposit = async (id: string) => {
    // La seguridad también está manejada a nivel de documento.
    try {
      await databases.deleteDocument(
        config.public.database,
        config.public.cDeposits,
        id
      );
      await getDeposits();
    } catch (error) {
      console.log("❌ error al borrar depósito", error);
    }
  };

  // La carga inicial ahora se maneja al obtener el usuario.
  // Podemos llamar a getDeposits cuando el usuario cambie.
  watch(user, (newUser) => {
    if (newUser) {
      getDeposits();
    } else {
      deposits.value = []; // Si el usuario cierra sesión, vaciamos la lista
    }
  }, { immediate: true }); // `immediate` hace que se ejecute una vez al principio

  return {
    deposits,
    isLoading, // Exponemos isLoading por si lo necesitamos en la UI
    createDeposit,
    updateDeposit,
    deleteDeposit,
  };
};
