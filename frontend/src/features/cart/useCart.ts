"use client";

import { useContext } from "react";

import { CartContext, type CartContextValue } from "./CartContext";

/** Acesso ao estado e ações do carrinho. Deve ser usado dentro de <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de <CartProvider>.");
  }
  return ctx;
}
