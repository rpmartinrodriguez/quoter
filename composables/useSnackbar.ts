interface ISnackbar {
  color: string;
  text: string;
}

const snackbar = reactive<ISnackbar>({
  color: "",
  text: "",
});

export const useSnackbar = () => {
  const show = computed(() => snackbar.text.length > 0);
  const text = computed(() => snackbar.text);
  const color = computed(() => snackbar.color);

  const setError = (t: string) => {
    snackbar.color = "error";
    snackbar.text = t;
  };

  const clear = () => {
    snackbar.color = "";
    snackbar.text = "";
  };
  return {
    show,
    text,
    color,
    setError,
    clear,
  };
};
