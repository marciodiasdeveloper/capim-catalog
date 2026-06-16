import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminOrder } from "@/server/admin/order-queries";
import { OrderStatusBadge } from "@/features/admin/order-status";
import {
  formatAddressLines,
  formatBRL,
  formatCpf,
  formatDateTime,
  formatPhone,
} from "@/lib/format";
import { OrderStatusControl } from "@/features/admin/components/OrderStatusControl";
import { SectionTitle } from "@/components/ui/section-title";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const endereco = formatAddressLines(order);

  return (
    <div className="space-y-6">
      <SectionTitle
        description={formatDateTime(order.createdAtISO)}
        action={<OrderStatusControl id={order.id} status={order.status} />}
      >
        Pedido #{order.number}
      </SectionTitle>

      <OrderStatusBadge status={order.status} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Cliente
            </p>
            {order.customerId ? (
              <Link
                href={`/admin/clientes/${order.customerId}`}
                className="text-primary font-medium hover:underline"
              >
                {order.customerName}
              </Link>
            ) : (
              <p className="font-medium">{order.customerName}</p>
            )}
            <p className="text-muted-foreground font-mono text-xs">
              {formatCpf(order.customerCpf)}
            </p>
            {order.customerPhone && <p>{formatPhone(order.customerPhone)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Endereço
            </p>
            {endereco.length ? (
              endereco.map((line) => <p key={line}>{line}</p>)
            ) : (
              <p>—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell>
                    {item.name}
                    {item.isWholesale && (
                      <Badge
                        variant="outline"
                        className="border-success/30 text-success ml-2"
                      >
                        atacado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.qty}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(item.lineTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator />

          <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>
                <Money value={order.subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Entrega{order.deliveryLabel ? ` · ${order.deliveryLabel}` : ""}
              </dt>
              <dd>
                {order.frete === 0 ? (
                  <span className="text-success">Grátis</span>
                ) : (
                  <Money value={order.frete} />
                )}
              </dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>
                <Money value={order.total} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Pontos</dt>
              <dd className="tabular-nums">{order.points}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {order.observacao && (
        <Card>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Observação
            </p>
            <p>{order.observacao}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
