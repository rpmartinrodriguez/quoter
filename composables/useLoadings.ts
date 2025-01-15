const loading = ref<boolean>(false);

export const useLoadings = () => {
  const toggleLoading = () => (loading.value = !loading.value);

  return {
    loading,
    toggleLoading,
  };
};
