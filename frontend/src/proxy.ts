import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/supabase";

/**
 * Proxy (antigo middleware, Next 16). Renova a sessão do Supabase nas rotas de
 * admin para que o token não expire entre navegações. Escopo restrito a /admin
 * e tolerante a falhas (nunca bloqueia a request).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    // Valida e, se necessário, renova a sessão (gravando cookies via setAll).
    await supabase.auth.getUser();
  } catch {
    // Falha de rede no refresh não deve derrubar a navegação do admin.
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
