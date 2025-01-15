const sponsoredUsers = ref<ISponsored[]>([]);

export const useSponsored = () => {
  const { user } = useSession();
  const { setError } = useSnackbar();

  const getSponsoredUsers = async () => {
    const res: any = await $fetch(`/api/sponsored/${user.value?.$id}`);

    if (res?.result === "fail") {
      setError(res.message);
      return;
    }

    const { parseSponsored } = useParse();
    sponsoredUsers.value = parseSponsored(res.sponsored);
  };

  return {
    sponsoredUsers,
    getSponsoredUsers,
  };
};
