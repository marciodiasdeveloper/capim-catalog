import { describe, it, expect, vi, afterEach } from "vitest";

import { lookupCep } from "./cep";

function mockFetch(impl: () => Partial<Response> | Promise<Partial<Response>>) {
  vi.stubGlobal("fetch", vi.fn(impl as unknown as typeof fetch));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lookupCep", () => {
  it("mapeia a resposta do ViaCEP para o endereço do domínio", async () => {
    mockFetch(() => ({
      ok: true,
      json: async () => ({
        logradouro: "Praça da Sé",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      }),
    }));
    const addr = await lookupCep("01001-000");
    expect(addr).toEqual({
      rua: "Praça da Sé",
      bairro: "Sé",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("não consulta para CEP com menos de 8 dígitos", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await lookupCep("123")).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("retorna null quando o ViaCEP responde { erro: true }", async () => {
    mockFetch(() => ({ ok: true, json: async () => ({ erro: true }) }));
    expect(await lookupCep("00000000")).toBeNull();
  });

  it("retorna null em resposta HTTP não-ok", async () => {
    mockFetch(() => ({ ok: false, json: async () => ({}) }));
    expect(await lookupCep("01001000")).toBeNull();
  });

  it("retorna null quando o fetch lança (rede/abort)", async () => {
    mockFetch(() => {
      throw new Error("network");
    });
    expect(await lookupCep("01001000")).toBeNull();
  });

  it("campos ausentes viram string vazia", async () => {
    mockFetch(() => ({ ok: true, json: async () => ({ uf: "RJ" }) }));
    expect(await lookupCep("20000000")).toEqual({
      rua: "",
      bairro: "",
      cidade: "",
      uf: "RJ",
    });
  });
});
