/** Validação simples do formulário do cliente. Funções puras. */

import type { Customer } from "@/types";
import { onlyDigits } from "./format";

export type CustomerErrors = Partial<Record<keyof Customer, string>>;

const REQUIRED: { field: keyof Customer; label: string }[] = [
  { field: "nome", label: "Informe o nome completo" },
  { field: "cpf", label: "Informe o CPF" },
  { field: "telefone", label: "Informe o telefone" },
  { field: "rua", label: "Informe a rua" },
  { field: "numero", label: "Informe o número" },
  { field: "bairro", label: "Informe o bairro" },
  { field: "cidade", label: "Informe a cidade" },
  { field: "cep", label: "Informe o CEP" },
];

export function validateCustomer(c: Customer): CustomerErrors {
  const errors: CustomerErrors = {};

  for (const { field, label } of REQUIRED) {
    if (!c[field]?.trim()) errors[field] = label;
  }

  if (c.cpf && onlyDigits(c.cpf).length !== 11) {
    errors.cpf = "CPF deve ter 11 dígitos";
  }
  if (c.telefone && onlyDigits(c.telefone).length < 10) {
    errors.telefone = "Telefone inválido";
  }
  if (c.cep && onlyDigits(c.cep).length !== 8) {
    errors.cep = "CEP deve ter 8 dígitos";
  }

  return errors;
}

export function hasErrors(errors: CustomerErrors): boolean {
  // Ignora chaves com valor undefined (ex.: erro de campo já limpo).
  return Object.values(errors).some(Boolean);
}
