/**
 * Tracker de analytics (lado cliente). Fire-and-forget: nunca lança, nunca
 * bloqueia a UI. Emite eventos anônimos para o endpoint /api/track.
 *
 * Anonimato/LGPD: o `session_id` é um id aleatório guardado no localStorage,
 * sem relação com CPF/cliente. Nada de PII sai daqui (o referrer é reduzido a
 * host antes de enviar).
 */
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AnalyticsType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "begin_checkout";

export interface TrackPayload {
  type: AnalyticsType;
  productId?: string;
  path?: string;
  qty?: number;
  uf?: string;
}

const SESSION_KEY = "capim:aid";
const ENDPOINT = "/api/track";

// ------------------------------------------------------------ helpers (puros)

/** Um id de sessão válido: string de 8 a 64 caracteres. */
export function isValidSessionId(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= 64;
}

/** Gera um id anônimo novo (UUID quando disponível; fallback aleatório). */
export function newSessionId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* sem crypto.randomUUID */
  }
  return `a${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

/** Reduz um referrer ao host (sem path/query) — mantém o dado livre de PII. */
export function safeHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).host || null;
  } catch {
    return null;
  }
}

/** Só conta "adição ao carrinho" quando a quantidade efetivamente aumenta. */
export function shouldTrackAdd(prevQty: number, nextQty: number): boolean {
  return nextQty > prevQty;
}

// ----------------------------------------------------------------- track

/** Lê (ou cria e persiste) o id anônimo da sessão no localStorage. */
function getSessionId(): string {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (isValidSessionId(stored)) return stored;
  } catch {
    /* storage indisponível */
  }
  const id = newSessionId();
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {
    /* noop */
  }
  return id;
}

/**
 * Envia um evento de analytics. No-op em SSR, em dev (evita ruído) e quando o
 * Supabase não está configurado (modo mock). Usa `sendBeacon` quando possível
 * (sobrevive ao unload), com fallback para `fetch(..., { keepalive })`.
 */
export function track(payload: TrackPayload): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (!isSupabaseConfigured()) return;

  const body = JSON.stringify({
    ...payload,
    sessionId: getSessionId(),
    referrer: safeHost(document.referrer),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* cai no fetch */
  }
  void fetch(ENDPOINT, {
    method: "POST",
    body,
    keepalive: true,
    headers: { "Content-Type": "application/json" },
  }).catch(() => {});
}
