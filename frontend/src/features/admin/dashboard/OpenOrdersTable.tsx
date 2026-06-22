import Link from "next/link";
import { Eye, MessageCircle, PartyPopper } from "lucide-react";

import type { Company } from "@/data/company";
import type { AdminOrder } from "@/server/admin/order-queries";
import { buildOpenOrderWhatsappMessage, buildWaLink } from "@/lib/whatsapp";
import { formatDateTime, onlyDigits } from "@/lib/format";
import { OrderStatusControl } from "@/features/admin/components/OrderStatusControl";
import { AgingBadge } from "./AgingBadge";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const MAX_ROWS = 12;

/** Fila acionável de pedidos pendentes (mais antigos primeiro = mais urgentes). */
export function OpenOrdersTable({
  orders,
  company,
}: {
  orders: AdminOrder[];
  company: Company;
}) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<PartyPopper />}
        title="Tudo em dia!"
        description="Nenhum pedido aguardando pagamento."
        className="text-success"
      />
    );
  }

  const sorted = [...orders].sort((a, b) =>
    a.createdAtISO.localeCompare(b.createdAtISO)
  );
  const rows = sorted.slice(0, MAX_ROWS);

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((order) => {
            const digits = onlyDigits(order.customerPhone ?? "");
            const waDigits = digits
              ? digits.startsWith("55")
                ? digits
                : `55${digits}`
              : "";
            const waLink = waDigits
              ? buildWaLink(
                  waDigits,
                  buildOpenOrderWhatsappMessage(
                    {
                      number: order.number,
                      customerName: order.customerName,
                      total: order.total,
                    },
                    company
                  )
                )
              : null;

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-primary font-medium tabular-nums hover:underline"
                  >
                    #{order.number}
                  </Link>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                    {formatDateTime(order.createdAtISO)}
                    <AgingBadge createdAtISO={order.createdAtISO} />
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
                <TableCell className="text-right">
                  <Money value={order.total} className="font-medium" />
                  <div className="text-muted-foreground text-xs tabular-nums">
                    {order.points} pts
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {waLink ? (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "text-success"
                        )}
                      >
                        <MessageCircle /> Cobrar
                      </a>
                    ) : (
                      <span
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "pointer-events-none opacity-50"
                        )}
                        title="Cliente sem telefone"
                      >
                        <MessageCircle /> Sem telefone
                      </span>
                    )}
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      <Eye /> Ver
                    </Link>
                    <OrderStatusControl id={order.id} status={order.status} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {orders.length > MAX_ROWS ? (
        <div className="text-center">
          <Link
            href="/admin/pedidos?status=pending"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Ver todos os {orders.length} pedidos em aberto
          </Link>
        </div>
      ) : null}
    </div>
  );
}
