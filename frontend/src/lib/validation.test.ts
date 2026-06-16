import { describe, it, expect } from "vitest";

import { validateCustomer, hasErrors } from "./validation";
import type { Customer } from "@/types";

const valid: Customer = {
  nome: "Márcio Dias",
  cpf: "12345678901",
  telefone: "1133334444",
  rua: "Rua A",
  numero: "10",
  bairro: "Centro",
  complemento: "",
  cidade: "Divinópolis",
  cep: "35500000",
  uf: "MG",
  observacao: "",
};

const empty: Customer = {
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

describe("validateCustomer", () => {
  it("cliente válido não tem erros", () => {
    const errors = validateCustomer(valid);
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it("cliente vazio acusa os 8 campos obrigatórios", () => {
    const errors = validateCustomer(empty);
    expect(Object.keys(errors).sort()).toEqual(
      ["bairro", "cep", "cidade", "cpf", "nome", "numero", "rua", "telefone"].sort()
    );
    expect(hasErrors(errors)).toBe(true);
  });

  it("campo só com espaços ainda é obrigatório", () => {
    expect(validateCustomer({ ...valid, nome: "   " }).nome).toBeTruthy();
  });

  it("CPF deve ter 11 dígitos", () => {
    expect(validateCustomer({ ...valid, cpf: "1234567890" }).cpf).toBe(
      "CPF deve ter 11 dígitos"
    );
    expect(validateCustomer({ ...valid, cpf: "123.456.789-01" }).cpf).toBeUndefined();
  });

  it("telefone precisa de ao menos 10 dígitos", () => {
    expect(validateCustomer({ ...valid, telefone: "123456789" }).telefone).toBe(
      "Telefone inválido"
    );
    expect(validateCustomer({ ...valid, telefone: "1133334444" }).telefone).toBeUndefined();
  });

  it("CEP deve ter 8 dígitos", () => {
    expect(validateCustomer({ ...valid, cep: "1234567" }).cep).toBe(
      "CEP deve ter 8 dígitos"
    );
    expect(validateCustomer({ ...valid, cep: "35500-000" }).cep).toBeUndefined();
  });
});

describe("hasErrors", () => {
  it("false para objeto vazio, true quando há mensagem", () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ nome: "x" })).toBe(true);
  });
});
