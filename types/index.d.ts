declare global {
  interface IProduct {
    $id?: string;
    color?: string;
    detail: string;
    composition: string;
    price: number | string;
    calculations?: Calculation[];
  }

  interface IDeposit {
    $id?: string;
    percentage: number;
  }

  interface IQuote {
    $id?: string;
    quantity: number;
    percentage: number;
  }

  interface ISignUpForm {
    sponsor: string;
    name: string;
    role: string | null;
    email: string;
    password: string;
  }

  interface ISponsor {
    $id: string;
    name: string;
    code: string;
  }
  interface ISponsored {
    $id: string;
    name: string;
    email: string;
    role: string;
  }

  interface IUserPref {
    theme: string;
  }

  interface IMetaData {
    sponsor_code: string | null;
    sponsor: ISponsor;
  }

  interface IUser {
    $id: string;
    name: string;
    email: string;
    prefs: IUserPref;
    status: boolean;
    role: string;
    sponsor_code: number | null;
  }
}

export {};
