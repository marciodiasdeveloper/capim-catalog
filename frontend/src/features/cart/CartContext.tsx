"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import type { CartItem, Customer, Order, OrderItem, Product } from "@/types";
import {
  findDeliveryOption,
  getDeliveryOptions,
  type DeliveryOption,
} from "@/data/shipping";
import { computeTotals, getUnitPrice } from "@/lib/pricing";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createOrder } from "@/server/orders/create-order";
import {
  FRETE_GRATIS_ACIMA,
  STORAGE_CART_KEY,
  STORAGE_LAST_ORDER_KEY,
  STORAGE_ORDER_REF_KEY,
  STORAGE_ORDER_SEQ_KEY,
} from "@/constants";

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

interface CartState {
  hydrated: boolean;
  /** Quantidades por productId. */
  quantities: Record<string, number>;
  customer: Customer;
  /** Id da modalidade de entrega escolhida. */
  deliveryId: string;
  lastOrder: Order | null;
}

type Action =
  | { type: "HYDRATE"; payload: Partial<CartState> }
  | { type: "SET_QTY"; productId: string; qty: number }
  | { type: "CLEAR_ITEMS" }
  | { type: "PATCH_CUSTOMER"; patch: Partial<Customer> }
  | { type: "SET_DELIVERY"; deliveryId: string }
  | { type: "SET_LAST_ORDER"; order: Order | null };

const initialState: CartState = {
  hydrated: false,
  quantities: {},
  customer: EMPTY_CUSTOMER,
  deliveryId: "",
  lastOrder: null,
};

function reducer(state: CartState, action: Action): CartState {
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

/** Sequência incremental de número de pedido, persistida localmente. */
function nextOrderId(): string {
  let current = 1279;
  try {
    const raw = localStorage.getItem(STORAGE_ORDER_SEQ_KEY);
    if (raw) current = parseInt(raw, 10) || current;
  } catch {
    /* storage indisponível */
  }
  const next = current + 1;
  try {
    localStorage.setItem(STORAGE_ORDER_SEQ_KEY, String(next));
  } catch {
    /* noop */
  }
  return String(next);
}

export interface CartContextValue {
  hydrated: boolean;
  items: CartItem[];
  quantities: Record<string, number>;
  count: number;
  subtotal: number;
  frete: number;
  total: number;
  freteGratis: boolean;
  customer: Customer;
  deliveryId: string;
  deliveryOptions: DeliveryOption[];
  selectedDelivery: DeliveryOption | null;
  lastOrder: Order | null;
  setQty: (productId: string, qty: number) => void;
  clearItems: () => void;
  patchCustomer: (patch: Partial<Customer>) => void;
  setDelivery: (deliveryId: string) => void;
  /** Cria o pedido localmente (sem servidor). Usado como fallback. */
  finalizeOrder: () => Order;
  /** Finaliza o pedido: persiste no servidor quando configurado, senão local. */
  submitOrder: () => Promise<Order>;
  /** Limpa último pedido e itens para começar um novo. */
  startNewOrder: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  products,
}: {
  children: React.ReactNode;
  /** Catálogo (id → produto) para reidratar o carrinho salvo. */
  products: Record<string, Product>;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hidrata do storage após montar (evita mismatch de SSR).
  useEffect(() => {
    const payload: Partial<CartState> = {};
    try {
      const rawCart = localStorage.getItem(STORAGE_CART_KEY);
      const rawOrder = sessionStorage.getItem(STORAGE_LAST_ORDER_KEY);
      if (rawCart) {
        const parsed = JSON.parse(rawCart) as Partial<CartState>;
        payload.quantities = parsed.quantities ?? {};
        payload.customer = { ...EMPTY_CUSTOMER, ...(parsed.customer ?? {}) };
        payload.deliveryId = parsed.deliveryId ?? "";
      }
      if (rawOrder) payload.lastOrder = JSON.parse(rawOrder) as Order;
    } catch {
      /* storage indisponível ou JSON inválido */
    }
    dispatch({ type: "HYDRATE", payload });
  }, []);

  // Persiste carrinho + dados do cliente + entrega.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_CART_KEY,
        JSON.stringify({
          quantities: state.quantities,
          customer: state.customer,
          deliveryId: state.deliveryId,
        })
      );
    } catch {
      /* noop */
    }
  }, [state.hydrated, state.quantities, state.customer, state.deliveryId]);

  // Persiste último pedido em sessionStorage.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      if (state.lastOrder) {
        sessionStorage.setItem(
          STORAGE_LAST_ORDER_KEY,
          JSON.stringify(state.lastOrder)
        );
      } else {
        sessionStorage.removeItem(STORAGE_LAST_ORDER_KEY);
      }
    } catch {
      /* noop */
    }
  }, [state.hydrated, state.lastOrder]);

  const items = useMemo<CartItem[]>(() => {
    return Object.entries(state.quantities)
      .map(([productId, qty]) => {
        const product = products[productId];
        return product ? { product, qty } : null;
      })
      .filter((it): it is CartItem => it !== null && it.qty > 0);
  }, [state.quantities, products]);

  const { subtotal, count } = useMemo(() => computeTotals(items), [items]);

  const deliveryOptions = useMemo(
    () => getDeliveryOptions(state.customer.uf),
    [state.customer.uf]
  );

  const selectedDelivery = useMemo(
    () => findDeliveryOption(state.customer.uf, state.deliveryId) ?? null,
    [state.customer.uf, state.deliveryId]
  );

  const freteGratis = subtotal > 0 && subtotal >= FRETE_GRATIS_ACIMA;
  const frete = selectedDelivery ? (freteGratis ? 0 : selectedDelivery.price) : 0;
  const total = subtotal + frete;

  const setQty = useCallback(
    (productId: string, qty: number) =>
      dispatch({ type: "SET_QTY", productId, qty }),
    []
  );
  const clearItems = useCallback(() => dispatch({ type: "CLEAR_ITEMS" }), []);
  const patchCustomer = useCallback(
    (patch: Partial<Customer>) => dispatch({ type: "PATCH_CUSTOMER", patch }),
    []
  );
  const setDelivery = useCallback(
    (deliveryId: string) => dispatch({ type: "SET_DELIVERY", deliveryId }),
    []
  );

  const finalizeOrder = useCallback((): Order => {
    const orderItems: OrderItem[] = items.map(({ product, qty }) => {
      const { price, isWholesale } = getUnitPrice(product, qty);
      return {
        productId: product.id,
        name: product.name,
        qty,
        unitPrice: price,
        lineTotal: price * qty,
        isWholesale,
      };
    });

    const order: Order = {
      id: nextOrderId(),
      items: orderItems,
      customer: state.customer,
      delivery: selectedDelivery
        ? {
            label: selectedDelivery.label,
            price: frete,
            eta: selectedDelivery.eta,
          }
        : null,
      subtotal,
      frete,
      total,
      createdAtISO: new Date().toISOString(),
    };

    dispatch({ type: "SET_LAST_ORDER", order });
    dispatch({ type: "CLEAR_ITEMS" });
    return order;
  }, [items, state.customer, selectedDelivery, subtotal, frete, total]);

  const submitOrder = useCallback(async (): Promise<Order> => {
    if (isSupabaseConfigured()) {
      try {
        const order = await createOrder({
          items: items.map((it) => ({ productId: it.product.id, qty: it.qty })),
          customer: state.customer,
          deliveryId: state.deliveryId,
        });
        // Guarda a referência (UUID) p/ destacar "você" no ranking depois.
        if (order.ref) {
          try {
            localStorage.setItem(STORAGE_ORDER_REF_KEY, order.ref);
          } catch {
            /* noop */
          }
        }
        dispatch({ type: "SET_LAST_ORDER", order });
        dispatch({ type: "CLEAR_ITEMS" });
        return order;
      } catch (error) {
        // Fallback: gera pedido local para não travar o fluxo do WhatsApp.
        // Loga para que falhas de persistência no servidor fiquem visíveis.
        console.error("Falha ao registrar pedido no servidor:", error);
        return finalizeOrder();
      }
    }
    return finalizeOrder();
  }, [items, state.customer, state.deliveryId, finalizeOrder]);

  const startNewOrder = useCallback(() => {
    dispatch({ type: "SET_LAST_ORDER", order: null });
    dispatch({ type: "CLEAR_ITEMS" });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      hydrated: state.hydrated,
      items,
      quantities: state.quantities,
      count,
      subtotal,
      frete,
      total,
      freteGratis,
      customer: state.customer,
      deliveryId: state.deliveryId,
      deliveryOptions,
      selectedDelivery,
      lastOrder: state.lastOrder,
      setQty,
      clearItems,
      patchCustomer,
      setDelivery,
      finalizeOrder,
      submitOrder,
      startNewOrder,
    }),
    [
      state.hydrated,
      state.quantities,
      state.customer,
      state.deliveryId,
      state.lastOrder,
      items,
      count,
      subtotal,
      frete,
      total,
      freteGratis,
      deliveryOptions,
      selectedDelivery,
      setQty,
      clearItems,
      patchCustomer,
      setDelivery,
      finalizeOrder,
      submitOrder,
      startNewOrder,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
