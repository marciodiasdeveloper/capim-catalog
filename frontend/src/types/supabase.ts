/**
 * Tipos do schema Supabase (public) — escritos a partir das migrations em
 * `supabase/migrations/`. Em um projeto conectado, podem ser regenerados com
 * `supabase gen types typescript`. Passados como generic em `createClient<Database>`
 * para que toda query/insert seja checada contra o schema em tempo de compilação.
 */

import type { PriceTier } from "@/types";

export type OrderStatus = "pending" | "paid" | "cancelled";

type Ts = string;

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          accent: string;
          icon: string;
          sort_order: number;
          created_at: Ts;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          accent?: string;
          icon?: string;
          sort_order?: number;
          created_at?: Ts;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          accent?: string;
          icon?: string;
          sort_order?: number;
          created_at?: Ts;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string;
          price: number;
          tiers: PriceTier[] | null;
          unit: string;
          min_qty: number;
          image: string | null;
          active: boolean;
          created_at: Ts;
          updated_at: Ts;
        };
        Insert: {
          id: string;
          category_id: string;
          name: string;
          description?: string;
          price: number;
          tiers?: PriceTier[] | null;
          unit?: string;
          min_qty?: number;
          image?: string | null;
          active?: boolean;
          created_at?: Ts;
          updated_at?: Ts;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          price?: number;
          tiers?: PriceTier[] | null;
          unit?: string;
          min_qty?: number;
          image?: string | null;
          active?: boolean;
          created_at?: Ts;
          updated_at?: Ts;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          number: number;
          customer_id: string | null;
          customer_name: string;
          customer_cpf: string;
          customer_phone: string | null;
          rua: string | null;
          numero: string | null;
          bairro: string | null;
          complemento: string | null;
          cidade: string | null;
          uf: string | null;
          cep: string | null;
          observacao: string | null;
          delivery_label: string | null;
          delivery_price: number;
          subtotal: number;
          frete: number;
          total: number;
          points: number;
          status: OrderStatus;
          created_at: Ts;
        };
        Insert: {
          id?: string;
          number?: number;
          customer_id?: string | null;
          customer_name: string;
          customer_cpf: string;
          customer_phone?: string | null;
          rua?: string | null;
          numero?: string | null;
          bairro?: string | null;
          complemento?: string | null;
          cidade?: string | null;
          uf?: string | null;
          cep?: string | null;
          observacao?: string | null;
          delivery_label?: string | null;
          delivery_price?: number;
          subtotal?: number;
          frete?: number;
          total?: number;
          points?: number;
          status?: OrderStatus;
          created_at?: Ts;
        };
        Update: {
          status?: OrderStatus;
          customer_id?: string | null;
          [key: string]: string | number | null | undefined;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          name: string;
          qty: number;
          unit_price: number;
          line_total: number;
          is_wholesale: boolean;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          name: string;
          qty: number;
          unit_price: number;
          line_total: number;
          is_wholesale?: boolean;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          name?: string;
          qty?: number;
          unit_price?: number;
          line_total?: number;
          is_wholesale?: boolean;
        };
        Relationships: [];
      };
      customers: {
        Row: {
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
          created_at: Ts;
          updated_at: Ts;
        };
        Insert: {
          id?: string;
          cpf: string;
          name: string;
          phone?: string | null;
          rua?: string | null;
          numero?: string | null;
          bairro?: string | null;
          complemento?: string | null;
          cidade?: string | null;
          uf?: string | null;
          cep?: string | null;
          observacao?: string | null;
          created_at?: Ts;
          updated_at?: Ts;
        };
        Update: {
          cpf?: string;
          name?: string;
          phone?: string | null;
          rua?: string | null;
          numero?: string | null;
          bairro?: string | null;
          complemento?: string | null;
          cidade?: string | null;
          uf?: string | null;
          cep?: string | null;
          observacao?: string | null;
          updated_at?: Ts;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
