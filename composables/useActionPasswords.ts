import { Query } from "appwrite";

export const useActionPasswords = () => {
  const config = useRuntimeConfig();
  const { databases } = useAppwrite();

  // ✅ Estados de validación como constantes legibles
  const PasswordCheckResult = {
    VALID: 201,
    INVALID: 404,
    ERROR: 500,
  };

  const checkPassword = async (t: string, p: string): Promise<number> => {
    try {
      const result = await databases.listDocuments(
        config.public.database,
        config.public.cActionPasswords,
        [Query.equal("type", t), Query.equal("password", p)]
      );

      return result.total === 0
        ? PasswordCheckResult.INVALID
        : PasswordCheckResult.VALID;
    } catch (error) {
      console.error("🛑 Error al verificar contraseña:", error);
      return PasswordCheckResult.ERROR;
    }
  };

  return {
    checkPassword,
  };
};
