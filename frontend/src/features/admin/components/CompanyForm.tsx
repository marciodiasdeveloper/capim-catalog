"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import type { Company } from "@/data/company";
import type { ActionState } from "@/server/admin/company-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyLogo } from "@/components/layout/CompanyLogo";

const PIX_KEY_TYPES = ["CPF", "CNPJ", "E-mail", "Telefone", "Aleatória"];

interface CompanyFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  company: Company;
}

export function CompanyForm({ action, company }: CompanyFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  // Avisa o usuário quando o salvamento conclui (erro fica no banner abaixo).
  useEffect(() => {
    if (state.ok) toast.success("Dados da empresa salvos.");
  }, [state]);

  // Libera o object URL do preview ao desmontar / trocar de arquivo.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    if (file) setRemoveLogo(false);
  }

  const shownLogo = removeLogo ? null : (preview ?? company.logoUrl);

  // Garante que o tipo salvo apareça mesmo se não estiver na lista padrão.
  const pixKeyTypes =
    company.pix.chaveTipo && !PIX_KEY_TYPES.includes(company.pix.chaveTipo)
      ? [company.pix.chaveTipo, ...PIX_KEY_TYPES]
      : PIX_KEY_TYPES;

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-2 text-sm">
          {state.error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Identidade</CardTitle>
          <CardDescription>
            Nome, slogan e logo exibidos no site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField id="name" label="Nome">
            <Input id="name" name="name" defaultValue={company.name} required />
          </FormField>
          <FormField id="tagline" label="Slogan (tagline)">
            <Input
              id="tagline"
              name="tagline"
              defaultValue={company.tagline}
              placeholder="Sua farmácia de bairro, agora online"
            />
          </FormField>

          <div className="space-y-2">
            <span className="text-muted-foreground text-xs">Logo</span>
            <div className="flex items-center gap-3">
              <CompanyLogo logoUrl={shownLogo} name={company.name} />
              <div className="grid min-w-0 gap-1.5">
                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-muted-foreground file:text-foreground file:bg-muted file:mr-3 file:rounded-md file:border-0 file:px-2 file:py-1 file:text-sm file:font-medium text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  PNG, JPG ou SVG, até 2 MB.
                </p>
              </div>
            </div>
            {company.logoUrl && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="removeLogo"
                  checked={removeLogo}
                  onChange={(event) => setRemoveLogo(event.target.checked)}
                  className="accent-primary size-4"
                />
                Remover logo atual (volta ao ícone padrão)
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
          <CardDescription>Canal de atendimento dos pedidos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="whatsapp" label="WhatsApp (DDI + DDD + número)">
            <Input
              id="whatsapp"
              name="whatsapp"
              inputMode="numeric"
              defaultValue={company.whatsapp}
              placeholder="5537999999999"
              required
            />
          </FormField>
          <FormField id="atendente" label="Atendente">
            <Input
              id="atendente"
              name="atendente"
              defaultValue={company.atendente}
              placeholder="Equipe Capim"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PIX</CardTitle>
          <CardDescription>
            Dados exibidos no checkout para pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="pixTitular" label="Titular" className="sm:col-span-2">
            <Input
              id="pixTitular"
              name="pixTitular"
              defaultValue={company.pix.titular}
            />
          </FormField>
          <FormField id="pixChaveTipo" label="Tipo da chave">
            <NativeSelect
              id="pixChaveTipo"
              name="pixChaveTipo"
              defaultValue={company.pix.chaveTipo}
            >
              {pixKeyTypes.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="pixChave" label="Chave">
            <Input
              id="pixChave"
              name="pixChave"
              defaultValue={company.pix.chave}
            />
          </FormField>
          <FormField id="pixBanco" label="Banco" className="sm:col-span-2">
            <Input
              id="pixBanco"
              name="pixBanco"
              defaultValue={company.pix.banco}
            />
          </FormField>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
