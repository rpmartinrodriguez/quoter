declare global {
  interface Product {
    $id?: string;
    color?: string;
    detail: string;
    composition: string;
    price: number | string;
    calculations?: Calculation[];
  }

  interface Deposit {
    $id?: string;
    percentage: number;
  }

  interface Quote {
    $id?: string;
    quantity: number;
    percentage: number;
  }
}

export {};
