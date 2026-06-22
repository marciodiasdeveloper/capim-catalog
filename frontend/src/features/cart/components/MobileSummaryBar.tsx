"use client";

import { ShoppingCart } from "lucide-react";

import { useCart } from "../useCart";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";

/**
 * Barra fixa no rodapé (somente mobile) com contagem de itens + total e o
 * botão "Ver resumo", que rola suavemente até a seção #resumo. No desktop a
 * sidebar sticky já cumpre esse papel, então a barra fica oculta (`lg:hidden`).
 */
export function MobileSummaryBar() {
  const { hydrated, count, total } = useCart();

  // Evita flash no SSR/rehidratação e some quando o carrinho está vazio.
  if (!hydrated || count === 0) return null;

  function verResumo() {
    document
      .getElementById("resumo")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* Espaçador em fluxo: reserva altura no fim do conteúdo para o botão
          "Finalizar pedido" não ficar escondido atrás da barra fixa. */}
      <div aria-hidden className="h-20 lg:hidden" />

      <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden animate-in slide-in-from-bottom duration-300">
        <Container className="flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-muted-foreground text-xs tabular-nums">
              {count} {count === 1 ? "item" : "itens"}
            </span>
            <Money value={total} className="text-base font-bold" />
          </div>

          <Button
            type="button"
            size="lg"
            onClick={verResumo}
            aria-label="Ver resumo do pedido"
            className="h-11 px-5 text-base"
          >
            <ShoppingCart className="size-4" />
            Ver resumo
          </Button>
        </Container>
      </div>
    </>
  );
}
