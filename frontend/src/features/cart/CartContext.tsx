"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import type { CartItem, Coupon, Customer, Order, Product } from "@/types";
import {
  findDeliveryOption,
  getDeliveryOptions,
  type DeliveryOption,
} from "@/data/shipping";
import { computeOrder, computeTotals, resolveFreight, roundMoney } from "@/lib/pricing";
import { evaluateCoupon } from "@/lib/coupon";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createOrder } from "@/server/orders/create-order";
import { applyCoupon as applyCouponAction } from "@/server/orders/apply-coupon";
import {
  ORDER_SEQ_START,
  STORAGE_CART_KEY,
  STORAGE_LAST_ORDER_KEY,
  STORAGE_ORDER_REF_KEY,
  STORAGE_ORDER_SEQ_KEY,
} from "@/constants";
import {
  EMPTY_CUSTOMER,
  initialState,
  reducer,
  type CartState,
} from "./cart-reducer";

import { parseStoredCart, parseStoredOrder } from "./cart-storage";

export { EMPTY_CUSTOMER };

/** Sequência incremental de número de pedido, persistida localmente. */
function nextOrderId(): string {
  let current = ORDER_SEQ_START;
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
  /** Desconto do cupom aplicado (0 se nenhum/não qualifica). */
  discount: number;
  frete: number;
  total: number;
  freteGratis: boolean;
  customer: Customer;
  deliveryId: string;
  deliveryOptions: DeliveryOption[];
  selectedDelivery: DeliveryOption | null;
  /** Cupom aplicado (pode estar válido mas o carrinho ainda não qualificar). */
  coupon: Coupon | null;
  /** Aviso quando o cupom está aplicado mas não qualifica (ex.: faltam itens). */
  couponHint: string | null;
  lastOrder: Order | null;
  setQty: (productId: string, qty: number) => void;
  clearItems: () => void;
  patchCustomer: (patch: Partial<Customer>) => void;
  setDelivery: (deliveryId: string) => void;
  /** Valida e aplica um cupom pelo código. */
  applyCoupon: (code: string) => Promise<{ error?: string }>;
  removeCoupon: () => void;
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
      const cart = parseStoredCart(localStorage.getItem(STORAGE_CART_KEY));
      if (cart) {
        payload.quantities = cart.quantities;
        payload.customer = cart.customer;
        payload.deliveryId = cart.deliveryId;
        payload.appliedCoupon = cart.appliedCoupon ?? null;
      }
      const order = parseStoredOrder(
        sessionStorage.getItem(STORAGE_LAST_ORDER_KEY)
      );
      if (order) payload.lastOrder = order;
    } catch {
      /* storage indisponível */
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
          appliedCoupon: state.appliedCoupon,
        })
      );
    } catch {
      /* noop */
    }
  }, [
    state.hydrated,
    state.quantities,
    state.customer,
    state.deliveryId,
    state.appliedCoupon,
  ]);

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
        if (!product || qty <= 0) return null;
        // Espelha o clamp do servidor: a quantidade efetiva nunca fica abaixo do mínimo.
        return { product, qty: Math.max(qty, product.minQty) };
      })
      .filter((it): it is CartItem => it !== null);
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

  const { frete, freteGratis } = resolveFreight(
    subtotal,
    selectedDelivery ? selectedDelivery.price : null
  );

  // Re-avalia o cupom aplicado contra o carrinho atual (desconto + aviso).
  const couponEvaluation = useMemo(
    () =>
      state.appliedCoupon
        ? evaluateCoupon(state.appliedCoupon, { subtotal, count })
        : null,
    [state.appliedCoupon, subtotal, count]
  );
  const discount = couponEvaluation?.ok ? couponEvaluation.discount : 0;
  const couponHint = couponEvaluation?.hint ?? couponEvaluation?.reason ?? null;

  const total = roundMoney(subtotal - discount + frete);

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
  const applyCoupon = useCallback(
    async (code: string): Promise<{ error?: string }> => {
      const result = await applyCouponAction(code);
      if (result.error || !result.coupon) {
        return { error: result.error ?? "Cupom inválido." };
      }
      dispatch({ type: "SET_COUPON", coupon: result.coupon });
      return {};
    },
    []
  );
  const removeCoupon = useCallback(
    () => dispatch({ type: "SET_COUPON", coupon: null }),
    []
  );

  const finalizeOrder = useCallback((): Order => {
    // Usa o mesmo cálculo autoritativo do servidor (computeOrder) para que o
    // pedido local de fallback seja idêntico ao que o servidor produziria.
    const computed = computeOrder(
      Object.values(products),
      items.map((it) => ({ productId: it.product.id, qty: it.qty })),
      state.customer.uf,
      state.deliveryId,
      state.appliedCoupon,
      new Date().toISOString()
    );

    const order: Order = {
      id: nextOrderId(),
      items: computed.orderItems,
      customer: state.customer,
      delivery: computed.delivery,
      subtotal: computed.subtotal,
      discount: computed.discount,
      couponCode: computed.coupon?.code ?? null,
      frete: computed.frete,
      total: computed.total,
      points: computed.points,
      createdAtISO: new Date().toISOString(),
    };

    dispatch({ type: "SET_LAST_ORDER", order });
    dispatch({ type: "CLEAR_ITEMS" });
    return order;
  }, [items, products, state.customer, state.deliveryId, state.appliedCoupon]);

  const submitOrder = useCallback(async (): Promise<Order> => {
    if (isSupabaseConfigured()) {
      try {
        const order = await createOrder({
          items: items.map((it) => ({ productId: it.product.id, qty: it.qty })),
          customer: state.customer,
          deliveryId: state.deliveryId,
          couponCode: state.appliedCoupon?.code,
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
  }, [items, state.customer, state.deliveryId, state.appliedCoupon, finalizeOrder]);

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
      discount,
      frete,
      total,
      freteGratis,
      customer: state.customer,
      deliveryId: state.deliveryId,
      deliveryOptions,
      selectedDelivery,
      coupon: state.appliedCoupon,
      couponHint,
      lastOrder: state.lastOrder,
      setQty,
      clearItems,
      patchCustomer,
      setDelivery,
      applyCoupon,
      removeCoupon,
      finalizeOrder,
      submitOrder,
      startNewOrder,
    }),
    [
      state.hydrated,
      state.quantities,
      state.customer,
      state.deliveryId,
      state.appliedCoupon,
      state.lastOrder,
      items,
      count,
      subtotal,
      discount,
      frete,
      total,
      freteGratis,
      deliveryOptions,
      selectedDelivery,
      couponHint,
      setQty,
      clearItems,
      patchCustomer,
      setDelivery,
      applyCoupon,
      removeCoupon,
      finalizeOrder,
      submitOrder,
      startNewOrder,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
