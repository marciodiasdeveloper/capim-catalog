import { describe, it, expect } from "vitest";

import { buildOrderMessage, buildWaLink } from "./whatsapp";
import type { Order } from "@/types";
import type { Company } from "@/data/company";

const company = { name: "Capim Farma", whatsapp: "553799447506" } as Company;

const baseOrder: Order = {
  id: "1280",
  items: [
    {
      productId: "dipirona-500",
      name: "Dipirona 500mg",
      qty: 5,
      unitPrice: 5.9,
      lineTotal: 29.5,
      isWholesale: true,
    },
    {
      productId: "agua",
      name: "Água 500ml",
      qty: 1,
      unitPrice: 2,
      lineTotal: 2,
      isWholesale: false,
    },
  ],
  customer: {
    nome: "Márcio Dias",
    cpf: "012.104.076-39",
    telefone: "(37) 98417-1388",
    rua: "Rua Monte Santo",
    numero: "601",
    bairro: "Santo Antônio",
    complemento: "apto 201",
    cidade: "Divinópolis",
    cep: "35502-036",
    uf: "MG",
    observacao: "sem pressa",
  },
  delivery: { label: "Sedex", price: 28, eta: "2 a 4 dias úteis" },
  subtotal: 31.5,
  frete: 28,
  total: 59.5,
  points: 109,
  createdAtISO: "2026-06-16T12:00:00.000Z",
};

describe("buildOrderMessage", () => {
  it("inclui cabeçalho, cliente e endereço", () => {
    const msg = buildOrderMessage(baseOrder, company);
    expect(msg).toContain("*Pedido #1280* — Capim Farma");
    expect(msg).toContain("*Cliente:* Márcio Dias");
    expect(msg).toContain("Rua Monte Santo, 601");
    expect(msg).toContain("apto 201");
    expect(msg).toContain("Divinópolis / MG");
    expect(msg).toContain("CEP 35502-036");
  });

  it("marca itens de atacado e varejo", () => {
    const msg = buildOrderMessage(baseOrder, company);
    expect(msg).toContain("5x Dipirona 500mg (Atacado)");
    expect(msg).toContain("1x Água 500ml (Varejo)");
  });

  it("mostra entrega e totais", () => {
    const msg = buildOrderMessage(baseOrder, company);
    expect(msg).toContain("*Entrega:* Sedex");
    expect(msg).toContain("*Total:*");
    expect(msg).toContain("*Obs.:* sem pressa");
  });

  it("retirada (frete 0, abaixo do limite) aparece como 'Sem frete'", () => {
    const pickup: Order = {
      ...baseOrder,
      frete: 0,
      subtotal: 31.5,
      delivery: { label: "Retirada no balcão", price: 0, eta: "Hoje" },
    };
    const msg = buildOrderMessage(pickup, company);
    expect(msg).toContain("*Frete:* Sem frete");
    expect(msg).toContain("Retirada no balcão (Sem frete)");
  });

  it("frete grátis (acima do limite) aparece como 'Grátis'", () => {
    const freeShip: Order = {
      ...baseOrder,
      frete: 0,
      subtotal: 400,
      delivery: { label: "Sedex", price: 0, eta: "2 a 4 dias úteis" },
    };
    const msg = buildOrderMessage(freeShip, company);
    expect(msg).toContain("*Frete:* Grátis");
    expect(msg).toContain("Sedex (Grátis)");
  });

  it("omite linhas opcionais quando ausentes", () => {
    const minimal: Order = {
      ...baseOrder,
      delivery: null,
      customer: { ...baseOrder.customer, complemento: "", observacao: "", cep: "" },
    };
    const msg = buildOrderMessage(minimal, company);
    expect(msg).not.toContain("apto 201");
    expect(msg).not.toContain("*Obs.:*");
    expect(msg).not.toContain("*Entrega:*");
    expect(msg).not.toContain("CEP ");
  });
});

describe("buildWaLink", () => {
  it("monta o deep-link com texto codificado", () => {
    const link = buildWaLink("553799447506", "Olá mundo & cia");
    expect(link).toBe(
      "https://wa.me/553799447506?text=Ol%C3%A1%20mundo%20%26%20cia"
    );
  });
});
