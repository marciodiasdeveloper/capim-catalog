"use client";

import { useActionState } from "react";

import { signInAdmin, type AuthState } from "@/server/admin/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signInAdmin,
    {}
  );

  return (
    <form action={action} className="space-y-3">
      {state.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-2 text-sm">
          {state.error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-muted-foreground text-xs">
          E-mail
        </Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-muted-foreground text-xs">
          Senha
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
