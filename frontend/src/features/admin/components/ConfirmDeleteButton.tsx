"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  /** Server Action já vinculada ao id (ex.: deleteProduct.bind(null, id)). */
  action: () => Promise<{ error?: string }>;
  confirmMessage?: string;
  /** Se informado, navega para esta rota após excluir (em vez de refresh). */
  redirectTo?: string;
  label?: string;
}

export function ConfirmDeleteButton({
  action,
  confirmMessage = "Tem certeza que deseja excluir?",
  redirectTo,
  label,
}: ConfirmDeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Excluído.");
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      aria-label="Excluir"
    >
      <Trash2 />
      {label}
    </Button>
  );
}
