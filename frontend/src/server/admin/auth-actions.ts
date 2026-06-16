"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createAuthClient, isAdminEmail } from "@/lib/supabase/auth";

export interface AuthState {
  error?: string;
}

export async function signInAdmin(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase não configurado. Preencha o .env.local." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Informe e-mail e senha." };
  if (!isAdminEmail(email)) {
    return { error: "Este e-mail não tem acesso ao admin." };
  }

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha inválidos." };

  redirect("/admin");
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
