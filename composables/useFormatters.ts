export const useFormatters = () => {
  const arsFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  const formatAsArs = (data: number) => arsFormatter.format(data);

  return {
    formatAsArs,
  };
};
