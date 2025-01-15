const mdId = ref<string>("");

export const useMetaData = () => {
  const { databases } = useAppwrite();
  const { $id } = useSession();
  const config = useRuntimeConfig();

  const getMetaData = async () => {
    try {
      const md: any = await $fetch(`/api/user/meta-data/${$id.value}`);
      mdId.value = md.id;
      return md;
    } catch (error) {
      console.log("Error on get meta data ", error);
    }
  };

  return {
    mdId,
    getMetaData,
  };
};
