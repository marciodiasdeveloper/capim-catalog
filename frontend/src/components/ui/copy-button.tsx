"use client";

import { useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface CopyButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
  value: string;
  toastMessage?: string;
}

/** Botão que copia `value` para a área de transferência e dá feedback. */
export function CopyButton({
  value,
  toastMessage = "Copiado!",
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(toastMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <Button type="button" onClick={handleCopy} {...props}>
      {copied ? <Check /> : <Copy />}
      {children}
    </Button>
  );
}
