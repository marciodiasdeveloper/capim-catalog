import type { OrderStatus } from "@/server/admin/order-queries";
import { Badge } from "@/components/ui/badge";

/** Rótulo e cor por status de pedido (reusado nas telas do admin). */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pendente", className: "text-warning" },
  paid: { label: "Pago", className: "text-success" },
  cancelled: { label: "Cancelado", className: "text-muted-foreground" },
};

/** Badge de status reutilizável. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
}
