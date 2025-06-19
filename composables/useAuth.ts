import { ref, onMounted } from 'vue';
import type { Models } from 'appwrite';

// Estado global para el usuario, accesible en toda la app
const user = ref<Models.User<Models.Preferences> | null>(null);

export const useAuth = () => {
  const { account } = useAppwrite();
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await account.get();
      user.value = currentUser;
    } catch (error) {
      user.value = null;
    }
  };

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    await fetchCurrentUser();
  };

  const logout = async () => {
    await account.deleteSession('current');
    user.value = null;
    await router.push('/login');
  };

  onMounted(() => {
    // ✅ Mejora: Quitamos el "if (!user.value)". Esto fuerza a que se verifique la sesión
    // del usuario cada vez que el layout principal se carga, lo cual es más seguro.
    fetchCurrentUser();
  });

  return {
    user,
    login,
    logout,
    fetchCurrentUser,
  };
};
