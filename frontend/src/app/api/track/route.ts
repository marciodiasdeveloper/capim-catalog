import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { rateLimit } from "@/server/orders/rate-limit";

/**
 * Ingestão de eventos de analytics (público, fire-and-forget). Recebe um evento
 * ou um pequeno lote (flush no unload via sendBeacon). Escreve via service_role.
 *
 * Postura defensiva: rate-limit por IP, validação estrita com zod e SEMPRE
 * responde 204 — inclusive em payload inválido (não dá sinal a bots) e quando o
 * Supabase não está configurado (modo mock). Analytics nunca quebra a UX.
 */

const eventSchema = z.object({
  type: z.enum(["page_view", "product_view", "add_to_cart", "begin_checkout"]),
  sessionId: z.string().min(8).max(64),
  productId: z.string().max(100).nullish(),
  path: z.string().max(300).nullish(),
  qty: z.coerce.number().int().min(1).max(9999).nullish(),
  uf: z.string().max(2).nullish(),
  referrer: z.string().max(300).nullish(),
});

const bodySchema = z.union([eventSchema, z.array(eventSchema).min(1).max(20)]);

const NO_CONTENT = new Response(null, { status: 204 });

export async function POST(request: Request) {
  // Modo mock: nada a persistir.
  if (!isSupabaseConfigured()) return NO_CONTENT;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  // page_view dispara a cada troca de rota — limite generoso por IP.
  if (!rateLimit(`track:${ip}`, 120, 60_000)) {
    return new Response(null, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NO_CONTENT;
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NO_CONTENT; // engole, sem 400 (anti-bot)

  const events = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;

  try {
    const supabase = createAdminClient();
    await supabase.from("analytics_events").insert(
      events.map((e) => ({
        type: e.type,
        session_id: e.sessionId,
        product_id: e.productId ?? null,
        path: e.path ?? null,
        qty: e.qty ?? null,
        uf: e.uf ?? null,
        referrer: e.referrer ?? null,
        user_agent: userAgent,
      }))
    );
  } catch {
    /* analytics nunca quebra UX */
  }

  return NO_CONTENT;
}
