/** Regras de negócio configuráveis (frete, gamificação). */

/** Subtotal a partir do qual o frete é grátis (qualquer modalidade de entrega). */
export const FRETE_GRATIS_ACIMA = 300;

/** Pontos de gamificação. */
export const PONTOS_POR_REAL = 1;
export const PONTOS_BONUS_POR_PEDIDO = 50;

/** Chaves de storage do carrinho, último pedido e sequência de número de pedido. */
export const STORAGE_CART_KEY = "capim:cart";
export const STORAGE_LAST_ORDER_KEY = "capim:last-order";
export const STORAGE_ORDER_SEQ_KEY = "capim:order-seq";
/** Referência (UUID) do último pedido persistido, p/ destacar "você" no ranking. */
export const STORAGE_ORDER_REF_KEY = "capim:order-ref";

/** Número inicial da sequência local de pedidos (fallback sem Supabase). */
export const ORDER_SEQ_START = 1279;

/** Regras exibidas na seção "Como ganhar pontos". */
export const POINT_RULES: { title: string; description: string }[] = [
  {
    title: `${PONTOS_POR_REAL} ponto por R$ 1 gasto`,
    description: "Cada real em pedidos vira ponto no ranking do mês.",
  },
  {
    title: `+${PONTOS_BONUS_POR_PEDIDO} pontos por pedido`,
    description: "Bônus fixo a cada pedido finalizado e pago.",
  },
  {
    title: "Top 3 ganham prêmios",
    description: "O pódio do mês concorre a descontos e brindes exclusivos.",
  },
];

/** Todos os estados brasileiros (26 + DF) com nome e sigla. */
export const BRAZIL_STATES: { uf: string; name: string }[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];
