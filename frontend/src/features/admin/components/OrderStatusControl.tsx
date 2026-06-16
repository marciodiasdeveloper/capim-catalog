"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Undo2, X } from "lucide-react";

import type { OrderStatus } from "@/server/admin/order-queries";
import { setOrderStatus } from "@/server/admin/order-actions";
import { Button } from "@/components/ui/button";

export function OrderStatusControl({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function change(next: OrderStatus) {
    startTransition(async () => {
      const result = await setOrderStatus(id, next);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Status atualizado.");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {status !== "paid" && (
        <Button
          size="sm"
          variant="outline"
          className="text-success"
          disabled={pending}
          onClick={() => change("paid")}
        >
          <Check /> Pago
        </Button>
      )}
      {status !== "cancelled" && (
        <Button
          size="sm"
          variant="outline"
          className="text-destructive"
          disabled={pending}
          onClick={() => change("cancelled")}
        >
          <X /> Cancelar
        </Button>
      )}
      {status !== "pending" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => change("pending")}
        >
          <Undo2 /> Reabrir
        </Button>
      )}
    </div>
  );
}
