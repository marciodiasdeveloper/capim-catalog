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
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
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
          discount: number;
          coupon_code: string | null;
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
          discount?: number;
          coupon_code?: string | null;
          points?: number;
          status?: OrderStatus;
          created_at?: Ts;
        };
        Update: {
          customer_id?: string | null;
          customer_name?: string;
          customer_cpf?: string;
          customer_phone?: string | null;
          delivery_label?: string | null;
          delivery_price?: number;
          subtotal?: number;
          frete?: number;
          total?: number;
          discount?: number;
          coupon_code?: string | null;
          points?: number;
          status?: OrderStatus;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
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
      company_settings: {
        Row: {
          id: string;
          name: string;
          tagline: string;
          whatsapp: string;
          atendente: string;
          pix_titular: string;
          pix_chave_tipo: string;
          pix_chave: string;
          pix_banco: string;
          logo_url: string | null;
          gamification_enabled: boolean;
          updated_at: Ts;
        };
        Insert: {
          id?: string;
          name: string;
          tagline?: string;
          whatsapp?: string;
          atendente?: string;
          pix_titular?: string;
          pix_chave_tipo?: string;
          pix_chave?: string;
          pix_banco?: string;
          logo_url?: string | null;
          gamification_enabled?: boolean;
          updated_at?: Ts;
        };
        Update: {
          id?: string;
          name?: string;
          tagline?: string;
          whatsapp?: string;
          atendente?: string;
          pix_titular?: string;
          pix_chave_tipo?: string;
          pix_chave?: string;
          pix_banco?: string;
          logo_url?: string | null;
          gamification_enabled?: boolean;
          updated_at?: Ts;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          min_items: number;
          min_subtotal: number;
          max_discount: number | null;
          active: boolean;
          max_uses: number | null;
          current_uses: number;
          expires_at: Ts | null;
          created_at: Ts;
          updated_at: Ts;
        };
        Insert: {
          id: string;
          code: string;
          description?: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          min_items?: number;
          min_subtotal?: number;
          max_discount?: number | null;
          active?: boolean;
          max_uses?: number | null;
          current_uses?: number;
          expires_at?: Ts | null;
          created_at?: Ts;
          updated_at?: Ts;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string;
          discount_type?: "percentage" | "fixed";
          discount_value?: number;
          min_items?: number;
          min_subtotal?: number;
          max_discount?: number | null;
          active?: boolean;
          max_uses?: number | null;
          current_uses?: number;
          expires_at?: Ts | null;
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
