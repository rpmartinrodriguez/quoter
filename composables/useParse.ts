import uniqolor from "uniqolor";
import { v4 as uuidv4 } from "uuid";

export const useParse = () => {
  /*
   * TRANSFORM APPWRITE COLLECTION DOCUMENT TO PRODUCT INTERFACE
   */
  const parseProducts = (mr: any): Product[] => {
    const parsed: Product[] = [];
    for (let i = 0; i < mr.length; i++) {
      const element = mr[i];
      const product: Product = {
        $id: element.$id,
        color: uniqolor(uuidv4(), {
          format: "rgb",
          saturation: 80,
          lightness: [70, 80],
        }).color,
        detail: element.detail,
        composition: element.composition,
        price: element.price,
      };

      parsed.push(product);
    }
    return parsed;
  };

  /*
   * TRANSFORM APPWRITE COLLECTION DOCUMENT TO QUOTE INTERFACE
   */
  const parseDeposits = (ds: any): Deposit[] => {
    const parsed: Deposit[] = [];
    for (let i = 0; i < ds.length; i++) {
      const element = ds[i];
      const d: Deposit = {
        $id: element.$id,
        percentage: element.percentage,
      };

      parsed.push(d);
    }
    return parsed;
  };

  /*
   * TRANSFORM APPWRITE COLLECTION DOCUMENT TO QUOTE INTERFACE
   */
  const parseQuotes = (qs: any): Quote[] => {
    const parsed: Quote[] = [];
    for (let i = 0; i < qs.length; i++) {
      const element = qs[i];
      const q: Quote = {
        $id: element.$id,
        quantity: element.quantity,
        percentage: element.percentage,
      };

      parsed.push(q);
    }
    return parsed;
  };

  return {
    parseProducts,
    parseDeposits,
    parseQuotes,
  };
};
