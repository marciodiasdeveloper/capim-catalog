"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { useCart } from "@/features/cart/useCart";
import { Button, buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface OrderActionsProps {
  message: string;
  waLink: string;
}

/** Ações da confirmação: abrir no WhatsApp, copiar mensagem, novo pedido. */
export function OrderActions({ message, waLink }: OrderActionsProps) {
  const router = useRouter();
  const { startNewOrder } = useCart();

  function handleNewOrder() {
    startNewOrder();
    router.push("/");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "lg" }))}
      >
        <MessageCircle /> Abrir no WhatsApp
      </a>

      <CopyButton
        value={message}
        variant="outline"
        size="lg"
        toastMessage="Mensagem copiada!"
      >
        Copiar mensagem
      </CopyButton>

      <Button variant="ghost" size="lg" onClick={handleNewOrder}>
        Fazer outro pedido
      </Button>
    </div>
  );
}
