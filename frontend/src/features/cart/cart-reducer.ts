/**
 * Estado e reducer do carrinho — lógica pura, sem React nem efeitos colaterais,
 * separada do provider para ser testável isoladamente.
 */

import type { Customer, Order } from "@/types";

export const EMPTY_CUSTOMER: Customer = {
  nome: "",
  cpf: "",
  telefone: "",
  rua: "",
  numero: "",
  bairro: "",
  complemento: "",
  cidade: "",
  cep: "",
  uf: "",
  observacao: "",
};

export interface CartState {
  hydrated: boolean;
  /** Quantidades por productId. */
  quantities: Record<string, number>;
  customer: Customer;
  /** Id da modalidade de entrega escolhida. */
  deliveryId: string;
  lastOrder: Order | null;
}

export type Action =
  | { type: "HYDRATE"; payload: Partial<CartState> }
  | { type: "SET_QTY"; productId: string; qty: number }
  | { type: "CLEAR_ITEMS" }
  | { type: "PATCH_CUSTOMER"; patch: Partial<Customer> }
  | { type: "SET_DELIVERY"; deliveryId: string }
  | { type: "SET_LAST_ORDER"; order: Order | null };

export const initialState: CartState = {
  hydrated: false,
  quantities: {},
  customer: EMPTY_CUSTOMER,
  deliveryId: "",
  lastOrder: null,
};

/** Reducer puro do carrinho. */
export function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };
    case "SET_QTY": {
      const quantities = { ...state.quantities };
      if (action.qty <= 0) delete quantities[action.productId];
      else quantities[action.productId] = action.qty;
      return { ...state, quantities };
    }
    case "CLEAR_ITEMS":
      return { ...state, quantities: {} };
    case "PATCH_CUSTOMER":
      return { ...state, customer: { ...state.customer, ...action.patch } };
    case "SET_DELIVERY":
      return { ...state, deliveryId: action.deliveryId };
    case "SET_LAST_ORDER":
      return { ...state, lastOrder: action.order };
    default:
      return state;
  }
}
