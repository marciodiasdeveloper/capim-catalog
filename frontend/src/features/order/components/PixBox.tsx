"use client";

import { useCompany } from "@/features/company/CompanyContext";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

/** Caixa com os dados do PIX e botão para copiar a chave. */
export function PixBox() {
  const { pix } = useCompany();

  return (
    <Card className="ring-primary/30">
      <CardContent className="space-y-3">
        <p className="text-primary text-sm font-semibold">Pague via PIX</p>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Titular</dt>
          <dd>{pix.titular}</dd>
          <dt className="text-muted-foreground">Chave ({pix.chaveTipo})</dt>
          <dd className="font-mono break-all">{pix.chave}</dd>
          <dt className="text-muted-foreground">Banco</dt>
          <dd>{pix.banco}</dd>
        </dl>

        <CopyButton
          value={pix.chave}
          variant="outline"
          size="sm"
          toastMessage="Chave PIX copiada!"
        >
          Copiar chave PIX
        </CopyButton>

        <p className="text-muted-foreground text-xs">
          Após o pagamento, envie o comprovante junto com o pedido pelo nosso
          WhatsApp.
        </p>
      </CardContent>
    </Card>
  );
}
