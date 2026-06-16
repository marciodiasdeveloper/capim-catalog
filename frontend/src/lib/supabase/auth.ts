import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured } from "./server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Cliente Supabase ciente da sessão (cookies). Use em Server Actions/Components. */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // chamado fora de um contexto que pode escrever cookies (Server Component)
        }
      },
    },
  });
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** True se o e-mail está na allowlist de admins. Sem allowlist, ninguém é admin. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export interface AdminUser {
  id: string;
  email: string;
}

/** Retorna o admin logado, ou null. */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return { id: user.id, email: user.email ?? "" };
}

/** Exige admin logado; redireciona para o login caso contrário. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
