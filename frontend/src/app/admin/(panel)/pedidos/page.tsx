import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { getAdminOrders, type OrderStatus } from "@/server/admin/order-queries";
import { OrderStatusBadge } from "@/features/admin/order-status";
import { formatBRL, formatDateTime } from "@/lib/format";
import { OrderStatusControl } from "@/features/admin/components/OrderStatusControl";
import { SectionTitle } from "@/components/ui/section-title";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "paid", label: "Pagos" },
  { value: "cancelled", label: "Cancelados" },
];

const VALID_STATUS: OrderStatus[] = ["pending", "paid", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status && VALID_STATUS.includes(sp.status as OrderStatus)
      ? (sp.status as OrderStatus)
      : undefined;
  const month = sp.month === "current";

  const orders = await getAdminOrders({ status, month });

  function hrefWith(next: { status?: string; month?: boolean }) {
    const params = new URLSearchParams();
    const s = next.status ?? status ?? "";
    const m = next.month ?? month;
    if (s) params.set("status", s);
    if (m) params.set("month", "current");
    const qs = params.toString();
    return qs ? `/admin/pedidos?${qs}` : "/admin/pedidos";
  }

  return (
    <div className="space-y-4">
      <SectionTitle description="O ranking conta apenas os pedidos pagos.">
        Pedidos
      </SectionTitle>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => {
          const active = (tab.value || undefined) === status;
          return (
            <Link
              key={tab.value}
              href={hrefWith({ status: tab.value })}
              className={cn(
                buttonVariants({
                  size: "sm",
                  variant: active ? "default" : "outline",
                }),
                "rounded-full"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
        <span className="bg-border mx-1 h-5 w-px" />
        <Link
          href={hrefWith({ month: !month })}
          className={cn(
            buttonVariants({
              size: "sm",
              variant: month ? "default" : "outline",
            }),
            "rounded-full"
          )}
        >
          Este mês
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="Nenhum pedido"
          description="Nenhum pedido para o filtro selecionado."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-primary font-medium tabular-nums hover:underline"
                  >
                    #{order.number}
                  </Link>
                  <div className="text-muted-foreground text-xs">
                    {formatDateTime(order.createdAtISO)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-muted-foreground text-xs">
                    {order.cidade}
                  </div>
                </TableCell>
                <TableCell className="max-w-56">
                  <span className="text-muted-foreground line-clamp-2 text-xs">
                    {order.items
                      .map((item) => `${item.qty}× ${item.name}`)
                      .join(", ")}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(order.total)}
                  <div className="text-muted-foreground text-xs">
                    {order.points} pts
                  </div>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <OrderStatusControl id={order.id} status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
