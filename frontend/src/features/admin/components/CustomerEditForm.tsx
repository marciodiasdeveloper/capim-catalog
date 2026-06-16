"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { CustomerRecord } from "@/types";
import {
  updateCustomer,
  type ActionState,
} from "@/server/admin/customer-actions";
import { BRAZIL_STATES } from "@/constants";
import { formatCpf } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

export function CustomerEditForm({ customer }: { customer: CustomerRecord }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCustomer,
    {}
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-2 text-sm">
          {state.error}
        </p>
      )}

      <input type="hidden" name="id" value={customer.id} />

      <FormField label="CPF">
        <Input value={formatCpf(customer.cpf)} readOnly />
      </FormField>

      <FormField id="name" label="Nome">
        <Input id="name" name="name" defaultValue={customer.name} required />
      </FormField>

      <FormField id="phone" label="Telefone">
        <Input id="phone" name="phone" defaultValue={customer.phone ?? ""} />
      </FormField>

      <div className="grid grid-cols-[1fr_5.5rem] gap-3">
        <FormField id="rua" label="Rua">
          <Input id="rua" name="rua" defaultValue={customer.rua ?? ""} />
        </FormField>
        <FormField id="numero" label="Número">
          <Input id="numero" name="numero" defaultValue={customer.numero ?? ""} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="bairro" label="Bairro">
          <Input id="bairro" name="bairro" defaultValue={customer.bairro ?? ""} />
        </FormField>
        <FormField id="complemento" label="Complemento">
          <Input
            id="complemento"
            name="complemento"
            defaultValue={customer.complemento ?? ""}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_7rem_4.5rem]">
        <FormField id="cidade" label="Cidade">
          <Input id="cidade" name="cidade" defaultValue={customer.cidade ?? ""} />
        </FormField>
        <FormField id="cep" label="CEP">
          <Input id="cep" name="cep" defaultValue={customer.cep ?? ""} />
        </FormField>
        <FormField id="uf" label="UF">
          <NativeSelect id="uf" name="uf" defaultValue={customer.uf ?? ""}>
            <option value="">--</option>
            {BRAZIL_STATES.map((state) => (
              <option key={state.uf} value={state.uf}>
                {state.uf}
              </option>
            ))}
          </NativeSelect>
        </FormField>
      </div>

      <FormField id="observacao" label="Observação">
        <Input
          id="observacao"
          name="observacao"
          defaultValue={customer.observacao ?? ""}
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Link
          href={`/admin/clientes/${customer.id}`}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
