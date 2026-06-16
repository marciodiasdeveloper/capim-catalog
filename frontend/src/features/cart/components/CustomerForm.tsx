"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";

import { useCart } from "../useCart";
import { formatCep, formatCpf, formatPhone, onlyDigits } from "@/lib/format";
import { lookupCep } from "@/lib/cep";
import {
  hasErrors,
  validateCustomer,
  type CustomerErrors,
} from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";

/** Formulário "Seus dados" — valida e finaliza o pedido, indo para a confirmação. */
export function CustomerForm() {
  const router = useRouter();
  const { customer, patchCustomer, items, selectedDelivery, submitOrder } =
    useCart();
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const lastLookupRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);

  /** Busca o endereço no ViaCEP quando o CEP tem 8 dígitos e preenche os campos. */
  async function runCepLookup(rawCep: string) {
    const digits = onlyDigits(rawCep);
    if (digits.length !== 8 || digits === lastLookupRef.current) return;
    lastLookupRef.current = digits;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setCepLoading(true);
    setCepError(null);
    const address = await lookupCep(digits, controller.signal);
    if (controller.signal.aborted) return;
    setCepLoading(false);

    if (!address) {
      setCepError("CEP não encontrado");
      lastLookupRef.current = ""; // permite nova tentativa do mesmo CEP
      return;
    }
    patchCustomer({
      rua: address.rua,
      bairro: address.bairro,
      cidade: address.cidade,
      uf: address.uf,
    });
    setErrors((prev) => ({ ...prev, cep: undefined }));
    document.getElementById("numero")?.focus(); // só falta o número
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Adicione produtos ao pedido antes de finalizar.");
      return;
    }
    if (!selectedDelivery) {
      toast.error("Selecione o estado e a forma de entrega no resumo.");
      const target = document.getElementById(customer.uf ? "entrega" : "estado");
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus();
      return;
    }
    const found = validateCustomer(customer);
    setErrors(found);
    if (hasErrors(found)) {
      toast.error("Revise os campos destacados.");
      const firstError = Object.keys(found)[0];
      if (firstError) document.getElementById(firstError)?.focus();
      return;
    }
    if (!consent) {
      toast.error("Confirme o consentimento para enviar o pedido.");
      return;
    }

    setSubmitting(true);
    try {
      await submitOrder();
      router.push("/confirmacao");
    } catch {
      toast.error("Não foi possível registrar o pedido. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-busy={submitting}>
      <h3 className="text-sm font-bold tracking-wide uppercase">Seus dados</h3>

      <FormField id="nome" label="Nome completo" error={errors.nome}>
        <Input
          id="nome"
          autoComplete="name"
          value={customer.nome}
          onChange={(e) => patchCustomer({ nome: e.target.value })}
          placeholder="Seu nome"
          aria-invalid={!!errors.nome}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="cpf" label="CPF" error={errors.cpf}>
          <Input
            id="cpf"
            autoComplete="off"
            value={customer.cpf}
            onChange={(e) => patchCustomer({ cpf: formatCpf(e.target.value) })}
            placeholder="000.000.000-00"
            inputMode="numeric"
            aria-invalid={!!errors.cpf}
          />
        </FormField>
        <FormField id="telefone" label="Telefone" error={errors.telefone}>
          <Input
            id="telefone"
            autoComplete="tel"
            value={customer.telefone}
            onChange={(e) =>
              patchCustomer({ telefone: formatPhone(e.target.value) })
            }
            placeholder="(00) 00000-0000"
            inputMode="tel"
            aria-invalid={!!errors.telefone}
          />
        </FormField>
      </div>

      <FormField id="cep" label="CEP" error={errors.cep ?? cepError ?? undefined}>
        <Input
          id="cep"
          autoComplete="postal-code"
          value={customer.cep}
          onChange={(e) => {
            const masked = formatCep(e.target.value);
            patchCustomer({ cep: masked });
            void runCepLookup(masked);
          }}
          onBlur={(e) => void runCepLookup(e.target.value)}
          placeholder="00000-000"
          inputMode="numeric"
          aria-invalid={!!(errors.cep ?? cepError)}
        />
        {cepLoading && (
          <p
            aria-live="polite"
            className="text-muted-foreground flex items-center gap-1.5 text-xs"
          >
            <Loader2 className="size-3 animate-spin" />
            Buscando endereço…
          </p>
        )}
      </FormField>

      <div className="grid grid-cols-[1fr_5.5rem] gap-3">
        <FormField id="rua" label="Rua" error={errors.rua}>
          <Input
            id="rua"
            autoComplete="address-line1"
            value={customer.rua}
            onChange={(e) => patchCustomer({ rua: e.target.value })}
            placeholder="Rua / Avenida"
            aria-invalid={!!errors.rua}
          />
        </FormField>
        <FormField id="numero" label="Número" error={errors.numero}>
          <Input
            id="numero"
            value={customer.numero}
            onChange={(e) => patchCustomer({ numero: e.target.value })}
            placeholder="123"
            aria-invalid={!!errors.numero}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="bairro" label="Bairro" error={errors.bairro}>
          <Input
            id="bairro"
            value={customer.bairro}
            onChange={(e) => patchCustomer({ bairro: e.target.value })}
            placeholder="Bairro"
            aria-invalid={!!errors.bairro}
          />
        </FormField>
        <FormField id="complemento" label="Complemento">
          <Input
            id="complemento"
            autoComplete="address-line2"
            value={customer.complemento}
            onChange={(e) => patchCustomer({ complemento: e.target.value })}
            placeholder="Apto, bloco…"
          />
        </FormField>
      </div>

      <FormField id="cidade" label="Cidade" error={errors.cidade}>
        <Input
          id="cidade"
          autoComplete="address-level2"
          value={customer.cidade}
          onChange={(e) => patchCustomer({ cidade: e.target.value })}
          placeholder="Cidade"
          aria-invalid={!!errors.cidade}
        />
      </FormField>

      <FormField id="observacao" label="Observação">
        <Textarea
          id="observacao"
          value={customer.observacao}
          onChange={(e) => patchCustomer({ observacao: e.target.value })}
          placeholder="Algo que devemos saber sobre o pedido?"
          rows={2}
        />
      </FormField>

      <label
        htmlFor="consent"
        className="text-muted-foreground flex cursor-pointer items-start gap-2 text-xs"
      >
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          className="mt-0.5"
        />
        <span>
          Autorizo o uso dos meus dados para processar este pedido e entrar em
          contato pelo WhatsApp.
        </span>
      </label>

      <Button
        type="submit"
        size="lg"
        disabled={items.length === 0 || !consent || submitting}
        className="bg-success text-success-foreground hover:bg-success/90 w-full"
      >
        <ShoppingBag /> {submitting ? "Enviando…" : "Finalizar pedido"}
      </Button>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-center text-xs">
          Adicione produtos ao pedido para finalizar.
        </p>
      ) : (
        !consent && (
          <p className="text-muted-foreground text-center text-xs">
            Marque o consentimento acima para finalizar.
          </p>
        )
      )}
    </form>
  );
}
