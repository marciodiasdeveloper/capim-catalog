/** Consulta de endereço por CEP via ViaCEP. Função pura/assíncrona, sem estado. */

import { onlyDigits } from "./format";

export interface CepAddress {
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
}

/** Consulta o ViaCEP. Retorna null para CEP incompleto, inexistente ou falha de rede. */
export async function lookupCep(
  cep: string,
  signal?: AbortSignal
): Promise<CepAddress | null> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.erro) return null;
    return {
      rua: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      uf: data.uf ?? "",
    };
  } catch {
    return null; // inclui AbortError de requisições obsoletas
  }
}
