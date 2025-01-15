const showPsswd = ref<boolean>(false);
const psswdInnerIcon = computed<string>(() =>
  showPsswd.value ? "mdi-eye" : "mdi-eye-off"
);
const psswdInputType = computed<string>(() =>
  showPsswd.value ? "text" : "password"
);

const actualPassword = ref<string>();
const passwordRules = [
  (value: string) => {
    if (!value) return "La contraseña es requerida";

    if (value.length < 8)
      return "La contraseña debe contener 8 caracteres como mínimo";

    return true;
  },
];

const validUpdate = ref<boolean>(false);

export const usePasswordField = () => {
  const togglePsswdShow = () => (showPsswd.value = !showPsswd.value);
  return {
    validUpdate,
    actualPassword,
    showPsswd,
    psswdInnerIcon,
    psswdInputType,
    passwordRules,
    togglePsswdShow,
  };
};
