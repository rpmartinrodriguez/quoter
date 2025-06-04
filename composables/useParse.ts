import uniqolor from "uniqolor";
import { v4 as uuidv4 } from "uuid";

export const useParse = () => {
  const parseProducts = (mr: any): Product[] => {
    return mr.map((element: any): Product => ({
      $id: element.$id || "",
      color: uniqolor(uuidv4(), {
        format: "rgb",
        saturation: 80,
        lightness: [70, 80],
      }).color,
      detail: element.detail || "",
      composition: element.composition || "",
      price: Number(element.price) || 0, // ✅ Corrección aplicada aquí
    }));
  };

  const parseDeposits = (ds: any): Deposit[] => {
    return ds.map((element: any): Deposit => ({
      $id: element.$id || "",
      percentage: typeof element.percentage === "number" ? element.percentage : 0,
    }));
  };

  const parseQuotes = (qs: any): Quote[] => {
    return qs.map((element: any): Quote => ({
      $id: element.$id || "",
      quantity: element.quantity || "",
      percentage: element.percentage || "",
    }));
  };

  return {
    parseProducts,
    parseDeposits,
    parseQuotes,
  };
};
