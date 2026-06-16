"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CircleCheckBig, PackageOpen, TriangleAlert } from "lucide-react";

import { useCart } from "@/features/cart/useCart";
import { COMPANY } from "@/data/company";
import { buildOrderMessage, buildWaLink } from "@/lib/whatsapp";
import { celebrate } from "@/lib/confetti";
import { formatInt } from "@/lib/format";
import { FRETE_GRATIS_ACIMA } from "@/constants";
import { Container } from "@/components/layout/Container";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { PaymentSteps } from "@/features/order/components/PaymentSteps";
import { PixBox } from "@/features/order/components/PixBox";
import { OrderMessageBox } from "@/features/order/components/OrderMessageBox";
import { OrderActions } from "@/features/order/components/OrderActions";
import { cn } from "@/lib/utils";

/** Classe base de entrada (fade + slide), com fill-mode para não "piscar" antes do delay. */
const reveal = "animate-in fade-in slide-in-from-bottom-3 duration-500";

/** Tela de confirmação: pedido recebido, dados de pagamento e ações de WhatsApp. */
export function ConfirmationScreen() {
  const { lastOrder, hydrated } = useCart();
  const celebratedRef = useRef(false);

  // Dispara o confetti uma única vez quando o pedido está disponível.
  useEffect(() => {
    if (hydrated && lastOrder && !celebratedRef.current) {
      celebratedRef.current = true;
      celebrate();
    }
  }, [hydrated, lastOrder]);

  if (!hydrated) {
    return (
      <Container className="py-10">
        <p className="text-muted-foreground text-center text-sm">Carregando…</p>
      </Container>
    );
  }

  if (!lastOrder) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={<PackageOpen />}
          title="Nenhum pedido para confirmar"
          description="Monte um pedido no catálogo para ver a confirmação aqui."
          action={
            <Link href="/" className={cn(buttonVariants())}>
              Ir para o catálogo
            </Link>
          }
        />
      </Container>
    );
  }

  const message = buildOrderMessage(lastOrder, COMPANY);
  const waLink = buildWaLink(COMPANY.whatsapp, message);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-xl space-y-5">
        <div className={cn("space-y-2 text-center", reveal)}>
          <span className="bg-primary/15 text-primary animate-in zoom-in-50 spin-in-3 mx-auto flex size-14 items-center justify-center rounded-full duration-500">
            <CircleCheckBig className="size-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-wide uppercase">
            Pedido #{lastOrder.id} recebido
          </h1>
          <p className="text-muted-foreground text-sm">
            Total:{" "}
            <Money
              value={lastOrder.total}
              className="text-foreground font-semibold"
            />
          </p>
          {lastOrder.points > 0 && (
            <p className="text-muted-foreground text-xs">
              Você ganhou{" "}
              <strong className="text-foreground">
                {formatInt(lastOrder.points)}
              </strong>{" "}
              {lastOrder.points === 1 ? "ponto" : "pontos"} no ranking do mês 🎉
            </p>
          )}
        </div>

        <div
          className={cn("bg-card rounded-xl p-4 ring-1 ring-foreground/10", reveal)}
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          <ul aria-label="Itens do pedido" className="space-y-2">
            {lastOrder.items.map((item) => (
              <li
                key={item.productId}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="text-muted-foreground">{item.qty}× </span>
                  {item.name}
                </span>
                <Money value={item.lineTotal} className="shrink-0" />
              </li>
            ))}
          </ul>

          {lastOrder.delivery && (
            <div className="text-muted-foreground mt-3 flex items-center justify-between gap-2 border-t pt-3 text-sm">
              <span className="min-w-0">
                {lastOrder.delivery.label}
                {lastOrder.delivery.eta && ` · ${lastOrder.delivery.eta}`}
              </span>
              {lastOrder.frete > 0 ? (
                <Money value={lastOrder.frete} className="text-foreground shrink-0" />
              ) : lastOrder.subtotal >= FRETE_GRATIS_ACIMA ? (
                <span className="text-success shrink-0">Grátis</span>
              ) : (
                <span className="shrink-0">Sem frete</span>
              )}
            </div>
          )}
        </div>

        <div
          className={reveal}
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          <PaymentSteps />
        </div>
        <div
          className={reveal}
          style={{ animationDelay: "275ms", animationFillMode: "both" }}
        >
          <PixBox />
        </div>
        <div
          className={reveal}
          style={{ animationDelay: "350ms", animationFillMode: "both" }}
        >
          <OrderMessageBox message={message} />
        </div>
        <div
          className={reveal}
          style={{ animationDelay: "425ms", animationFillMode: "both" }}
        >
          <OrderActions message={message} waLink={waLink} />
        </div>

        <div
          role="status"
          className={cn(
            "border-warning/30 bg-warning/10 text-warning flex items-start gap-2 rounded-lg border p-3 text-xs",
            reveal
          )}
          style={{ animationDelay: "500ms", animationFillMode: "both" }}
        >
          <TriangleAlert className="size-4 shrink-0" />
          <p>
            Lembre-se de enviar o comprovante de pagamento pelo WhatsApp após o
            PIX. Sem o comprovante o pedido não é confirmado.
          </p>
        </div>
      </div>
    </Container>
  );
}
