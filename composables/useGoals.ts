// composables/useGoals.ts
import { ref, watch } from 'vue';
import { ID, Query, Permission, Role } from 'appwrite';

// Definimos la estructura de un Resultado Clave
export interface IKeyResult {
  name: string; // ej: "Cerrar Ventas"
  target: number; // ej: 15
  // La métrica que usaremos para medir el progreso
  metric: 'salesCount' | 'demoCount' | 'followUpCompletedCount'; 
}

// Definimos la estructura de un Objetivo (Goal)
export interface IGoal {
  $id: string;
  objective: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  keyResults: IKeyResult[]; // Lo usaremos como un array de objetos
  userId: string;
}

// Estado singleton para los objetivos
const goals = ref<IGoal[]>([]);
const isLoading = ref(false);

export const useGoals = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();
  const { user } = useAuth();
  const COLLECTION_ID = config.public.cGoals; // ¡Recordá añadir cGoals a tu config!

  const getGoals = async () => {
    if (!user.value) { goals.value = []; return; }
    isLoading.value = true;
    try {
      const response = await databases.listDocuments(
        config.public.database,
        COLLECTION_ID,
        [
          Query.equal("userId", user.value.$id),
          Query.orderDesc('startDate')
        ]
      );
      
      // Appwrite guarda los datos complejos como texto JSON.
      // Aquí lo convertimos de vuelta a un objeto para poder usarlo en la app.
      goals.value = response.documents.map(doc => ({
        ...doc,
        keyResults: JSON.parse(doc.keyResults as string)
      })) as unknown as IGoal[];

    } catch (e) {
      console.error("Error al obtener objetivos:", e);
      goals.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const addGoal = async (data: Omit<IGoal, '$id' | 'userId'>) => {
    if (!user.value) throw new Error("No hay un usuario autenticado.");
    const userId = user.value.$id;
    
    // Antes de guardar, convertimos el array de keyResults a un string en formato JSON.
    const goalData = {
      ...data,
      keyResults: JSON.stringify(data.keyResults),
      userId
    };

    await databases.createDocument(
      config.public.database,
      COLLECTION_ID,
      ID.unique(),
      goalData,
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    await getGoals();
  };

  // La lista de objetivos reacciona a los cambios de sesión del usuario
  watch(user, (newUser) => {
    if (newUser) {
      getGoals();
    } else {
      goals.value = [];
    }
  }, { immediate: true });

  return { goals, isLoading, addGoal, getGoals };
};
