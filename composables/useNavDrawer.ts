const drawer = ref<boolean>(true);

interface IModuleNav {
  access: string[];
  name: string;
  icon: string;
  url: string;
}

const modules: IModuleNav[] = [
  {
    access: ["admin", "emprendedor"],
    name: "Ventas",
    icon: "mdi-cash-register",
    url: "/",
  },
  {
    access: ["admin"],
    name: "Patrocinados",
    icon: "mdi-account-group",
    url: "/sponsored",
  },
  {
    access: ["admin", "emprendedor"],
    name: "Cotizador",
    icon: "mdi-invoice-list",
    url: "/quoter",
  },
  {
    access: ["admin", "emprendedor"],
    name: "Cuenta",
    icon: "mdi-account",
    url: "/account",
  },
];

const modulesPrivs = [];

export const useNavDrawer = () => {
  const toggleDrawer = () => (drawer.value = !drawer.value);

  const { role } = useSession();
  const options = computed<IModuleNav[]>(() =>
    modules.filter((m: IModuleNav) =>
      m.access.includes(role.value.toLowerCase())
    )
  );

  return {
    drawer,
    toggleDrawer,
    options,
  };
};
