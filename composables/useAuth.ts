// composables/useAuth.ts
import { ref } from 'vue';
import type { Models } from 'appwrite';

const user = ref<Models.User<Models.Preferences> | null>(null);

export const useAuth = () => {
  const { account } = useAppwrite();
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      user.value = await account.get();
    } catch (e) {
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

  return { user, login, logout, fetchCurrentUser };
};
