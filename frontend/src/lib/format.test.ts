import { describe, it, expect } from "vitest";

import {
  formatBRL,
  onlyDigits,
  formatCpf,
  formatCep,
  formatPhone,
  initials,
  shortName,
  formatInt,
  pluralize,
} from "./format";

describe("formatBRL", () => {
  it("formata reais com 2 casas e separador de milhar", () => {
    expect(formatBRL(0)).toContain("0,00");
    expect(formatBRL(6.9)).toContain("6,90");
    expect(formatBRL(1234.5)).toContain("1.234,50");
    expect(formatBRL(6.9)).toMatch(/R\$/);
  });
});

describe("onlyDigits", () => {
  it("remove tudo que não é dígito", () => {
    expect(onlyDigits("(11) 99999-8888")).toBe("11999998888");
    expect(onlyDigits("abc")).toBe("");
    expect(onlyDigits("")).toBe("");
  });
});

describe("formatCpf", () => {
  it("aplica a máscara 000.000.000-00", () => {
    expect(formatCpf("12345678901")).toBe("123.456.789-01");
  });
  it("formata parciais conforme digita", () => {
    expect(formatCpf("123")).toBe("123");
    expect(formatCpf("1234")).toBe("123.4");
    expect(formatCpf("1234567")).toBe("123.456.7");
  });
  it("trunca em 11 dígitos", () => {
    expect(formatCpf("123456789012345")).toBe("123.456.789-01");
  });
});

describe("formatCep", () => {
  it("aplica a máscara 00000-000", () => {
    expect(formatCep("12345678")).toBe("12345-678");
  });
  it("formata parcial e trunca em 8 dígitos", () => {
    expect(formatCep("12345")).toBe("12345");
    expect(formatCep("123456789")).toBe("12345-678");
  });
});

describe("formatPhone", () => {
  it("formata fixo de 10 dígitos", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });
  it("formata celular de 11 dígitos", () => {
    expect(formatPhone("11999998888")).toBe("(11) 99999-8888");
  });
  it("trunca em 11 dígitos", () => {
    expect(formatPhone("119999988887777")).toBe("(11) 99999-8888");
  });
});

describe("initials", () => {
  it("usa primeira e última inicial", () => {
    expect(initials("Júnior José")).toBe("JJ");
    expect(initials("ana maria de souza")).toBe("AS");
  });
  it("nome único usa só a primeira", () => {
    expect(initials("Ana")).toBe("A");
  });
});

describe("shortName", () => {
  it("encurta para primeiro + inicial do último", () => {
    expect(shortName("Júnior José")).toBe("Júnior J.");
  });
  it("nome único permanece igual", () => {
    expect(shortName("Ana")).toBe("Ana");
  });
});

describe("formatInt", () => {
  it("agrupa milhares em pt-BR", () => {
    expect(formatInt(1450)).toBe("1.450");
    expect(formatInt(7)).toBe("7");
    expect(formatInt(1234567)).toBe("1.234.567");
  });
});

describe("pluralize", () => {
  it("usa singular para 1 e plural para o resto", () => {
    expect(pluralize(1, "pedido", "pedidos")).toBe("1 pedido");
    expect(pluralize(3, "pedido", "pedidos")).toBe("3 pedidos");
    expect(pluralize(0, "pedido", "pedidos")).toBe("0 pedidos");
  });
});
