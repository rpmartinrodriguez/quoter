interface IQuoterModule {
  uploadExcel: boolean;
}

const QUOTER = {
  uploadExcel: ["admin"],
};

export const usePermissions = () => {
  const { role } = useSession();

  const quoterPrivs = computed<IQuoterModule>(() => {
    const qp: IQuoterModule = {
      uploadExcel: QUOTER.uploadExcel.indexOf(role.value.toLowerCase()) > -1,
    };

    return qp;
  });

  return {
    quoterPrivs,
  };
};
