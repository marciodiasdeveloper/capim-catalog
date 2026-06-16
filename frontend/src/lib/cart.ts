/** Regras puras de quantidade do carrinho. */

/**
 * Próxima quantidade respeitando o mínimo do produto: o resultado é sempre 0
 * (removido) ou >= `minQty`. Do zero, qualquer incremento salta para `minQty`;
 * reduzir abaixo do mínimo remove o item (0). Determinístico e puro.
 */
export function stepQty(current: number, next: number, minQty: number): number {
  if (next <= 0) return 0;
  if (next < minQty) return current === 0 ? minQty : 0;
  return next;
}
