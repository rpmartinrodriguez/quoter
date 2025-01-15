import uniqolor from "uniqolor";
import { v4 as uuidv4 } from "uuid";

export const useParse = () => {
  const parseUser = (u: any): IUser => {
    const user: IUser = {
      $id: u.$id,
      name: u.name,
      email: u.email,
      prefs: u.prefs,
      status: u.status,
      role: u.labels[0],
      sponsor_code: null,
    };

    return user;
  };

  /*
   * TRANSFORM APPWRITE COLLECTION DOCUMENT TO PRODUCT INTERFACE
   */
  const parseSponsored = (su: any): ISponsored[] => {
    const parsed: ISponsored[] = [];
    for (let i = 0; i < su.length; i++) {
      const element = su[i];
      const sponsored: ISponsored = {
        $id: element.$id,
        name: element.name,
        email: element.email,
        role: element.role,
      };

      parsed.push(sponsored);
    }
    return parsed;
  };

  /*
   * TRANSFORM APPWRITE COLLECTION DOCUMENT TO PRODUCT INTERFACE
   */
  const parseProducts = (mr: any): IProduct[] => {
    const parsed: IProduct[] = [];
    for (let i = 0; i < mr.length; i++) {
      const element = mr[i];
      const product: IProduct = {
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
  const parseDeposit = (qs: any): IDeposit[] => {
    const parsed: IDeposit[] = [];
    for (let i = 0; i < qs.length; i++) {
      const element = qs[i];
      const q: IDeposit = {
        $id: element.$id,
        percentage: element.percentage,
      };

      parsed.push(q);
    }
    return parsed;
  };

  /*
   * TRANSFORM APPWRITE COLLECTION DOCUMENT TO QUOTE INTERFACE
   */
  const parseQuotes = (qs: any): IQuote[] => {
    const parsed: IQuote[] = [];
    for (let i = 0; i < qs.length; i++) {
      const element = qs[i];
      const q: IQuote = {
        $id: element.$id,
        quantity: element.quantity,
        percentage: element.percentage,
      };

      parsed.push(q);
    }
    return parsed;
  };

  return {
    parseUser,
    parseSponsored,
    parseProducts,
    parseDeposit,
    parseQuotes,
  };
};
