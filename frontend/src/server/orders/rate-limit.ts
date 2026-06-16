import "server-only";

/**
 * Limitador de taxa simples, em memória (por processo/instância). Protege o
 * endpoint público de criação de pedido contra abuso/flood.
 *
 * Nota: em deploy serverless com múltiplas instâncias, isto limita por
 * instância. Para um teto global, troque por um store compartilhado
 * (ex.: Upstash/Redis) mantendo a mesma assinatura.
 */
const hits = new Map<string, number[]>();

/** Retorna false quando a chave excedeu `limit` requisições na janela `windowMs`. */
export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
