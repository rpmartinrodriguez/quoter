const user = ref<IUser | null>(null);
const password = ref<string>();

export const useSession = () => {
  const { account, databases } = useAppwrite();
  const { setError } = useSnackbar();
  const config = useRuntimeConfig();

  const signUp = async (f: ISignUpForm) => {
    const res: any = await $fetch("/api/user/register", {
      method: "POST",
      body: f,
    });

    if (res?.result === "fail") {
      setError(res.message);
      return;
    }

    await login({ email: f.email, password: f.password });
  };

  const login = async (cred: { email: string; password: string }) => {
    try {
      await account.createEmailPasswordSession(cred.email, cred.password);

      // Navigate to app
      return navigateTo("/");
    } catch (error: any) {
      if (error.code === 401) {
        const { setError } = useSnackbar();
        setError("Credenciales incorrectas");
      } else console.log("error on login", error);
    }
  };

  const { parseUser } = useParse();
  const setUser = async (u: any) => {
    user.value = parseUser(u);
    localStorage.setItem("theme", user.value.prefs.theme);
  };

  const saveEmail = async (e: string, p: string) => {
    try {
      await account.updateEmail(e, p);

      user.value!.email = e;
    } catch (error) {
      console.log("error on email update", error);
    }
  };

  const savePassword = async (np: string, op: string) => {
    try {
      await account.updatePassword(np, op);
    } catch (error) {
      console.log("error on email update", error);
    }
  };

  const saveName = async (n: string) => {
    try {
      const newUser = await account.updateName(n);
      user.value = parseUser(newUser);
    } catch (error) {
      console.log("error on name update", error);
    }
  };

  const saveSponsorCode = async (sc: string, id: string) => {
    try {
      const res = await databases.updateDocument(
        config.public.database,
        config.public.cUsersMetaData,
        id,
        { sponsor_code: parseInt(sc) }
      );
      return res;
    } catch (error) {
      console.log("error on name update", error);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      user.value = null;
      navigateTo("/auth/sign-in");
    } catch (error) {
      console.log("error on logout", error);
    }
  };

  const updateTheme = async (t: string) => {
    const prefs = { ...user.value?.prefs };
    prefs.theme = t;
    await account.updatePrefs(prefs);
  };

  const $id = computed<string | undefined>(() => user.value?.$id);
  const name = computed<string | undefined>(() => user.value?.name);
  const email = computed<string | undefined>(() => user.value?.email);

  const role = computed<string>(() =>
    user.value
      ? user.value?.role.charAt(0).toUpperCase() + user.value?.role.slice(1)
      : ""
  );

  return {
    $id,
    user,
    name,
    email,
    password,
    role,
    setUser,
    signUp,
    login,
    logout,
    saveEmail,
    savePassword,
    updateTheme,
    saveName,
    saveSponsorCode,
  };
};
