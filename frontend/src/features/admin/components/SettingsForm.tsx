"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import type { Company } from "@/data/company";
import type { ActionState } from "@/server/admin/company-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingsFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  company: Company;
}

export function SettingsForm({ action, company }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  // Avisa o usuário quando o salvamento conclui (erro fica no banner abaixo).
  useEffect(() => {
    if (state.ok) toast.success("Configurações salvas.");
  }, [state]);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-2 text-sm">
          {state.error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades</CardTitle>
          <CardDescription>
            Chaves que ligam ou desligam recursos do site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="gamificationEnabled"
              defaultChecked={company.gamificationEnabled}
              className="accent-primary mt-0.5 size-4"
            />
            <span className="grid gap-0.5">
              <span className="font-medium">Gamificação</span>
              <span className="text-muted-foreground text-xs">
                Exibe o ranking do mês e os pontos no site (banner da home, links
                no topo e no rodapé, e a página de ranking).
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
