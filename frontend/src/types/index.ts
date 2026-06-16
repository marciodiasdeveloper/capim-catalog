/**
 * Tipos de domínio centralizados.
 * Mantidos sem dependência de React/Next para serem reutilizáveis em qualquer camada.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  /** Cor de realce (hex) usada no thumb e nos destaques da categoria. */
  accent: string;
  /** Chave do ícone (mapeada para um ícone lucide na camada de UI). */
  icon: string;
}

/** Faixa de atacado: a partir de `minQty` unidades, o preço unitário passa a ser `price`. */
export interface PriceTier {
  minQty: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  /** Preço unitário no varejo. */
  price: number;
  /** Faixas de atacado (opcional), ordenadas por `minQty` crescente. */
  tiers?: PriceTier[];
  /** Unidade exibida (ex.: "un", "cx", "frasco"). */
  unit: string;
  /** Quantidade mínima por item ao adicionar ao pedido. */
  minQty: number;
  /** Caminho de imagem (uso futuro). Sem imagem usamos um thumb gerado. */
  image?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Customer {
  nome: string;
  cpf: string;
  telefone: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  cep: string;
  uf: string;
  observacao: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  isWholesale: boolean;
}

export interface OrderDelivery {
  label: string;
  price: number;
  /** Prazo estimado (ex.: "2 a 4 dias úteis"). */
  eta?: string;
}

export interface Order {
  /** Número do pedido sem o "#", ex.: "1280". */
  id: string;
  /** UUID do pedido persistido (token opaco p/ destacar "você" no ranking). */
  ref?: string;
  items: OrderItem[];
  customer: Customer;
  delivery: OrderDelivery | null;
  subtotal: number;
  frete: number;
  total: number;
  /** Pontos de gamificação ganhos no pedido. */
  points: number;
  createdAtISO: string;
}

/** Registro de cliente persistido (tabela customers). */
export interface CustomerRecord {
  id: string;
  cpf: string;
  name: string;
  phone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  observacao: string | null;
  createdAtISO: string;
}

export interface RankingUser {
  id: string;
  name: string;
  /** Cor base do avatar (classe utilitária ou hex). */
  avatarColor: string;
  cidade: string;
  pedidos: number;
  pontos: number;
}
