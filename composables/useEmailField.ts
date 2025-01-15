const emailRules = [
  (value: string) => {
    if (!value) return "El correo es requerido";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Correo inválido";

    return true;
  },
];

export const useEmailField = () => {
  return {
    emailRules,
  };
};
