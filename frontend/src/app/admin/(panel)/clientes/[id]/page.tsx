import Link from "next/link";
import { notFound } from "next/navigation";
import { SquarePen } from "lucide-react";

import {
  getAdminCustomer,
  getCustomerOrders,
} from "@/server/admin/customer-queries";
import { deleteCustomer } from "@/server/admin/customer-actions";
import { OrderStatusBadge } from "@/features/admin/order-status";
import {
  formatAddressLines,
  formatBRL,
  formatCpf,
  formatDateTime,
  formatPhone,
} from "@/lib/format";
import { ConfirmDeleteButton } from "@/features/admin/components/ConfirmDeleteButton";
import { SectionTitle } from "@/components/ui/section-title";
import { Card, CardContent } from "@/components/ui/card";
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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, orders] = await Promise.all([
    getAdminCustomer(id),
    getCustomerOrders(id),
  ]);
  if (!customer) notFound();

  const endereco = formatAddressLines(customer);

  return (
    <div className="space-y-6">
      <SectionTitle
        description={formatCpf(customer.cpf)}
        action={
          <div className="flex gap-2">
            <Link
              href={`/admin/clientes/${id}/editar`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <SquarePen /> Editar
            </Link>
            <ConfirmDeleteButton
              action={deleteCustomer.bind(null, id)}
              confirmMessage={`Excluir o cliente "${customer.name}"?`}
              redirectTo="/admin/clientes"
              label="Excluir"
            />
          </div>
        }
      >
        {customer.name}
      </SectionTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Contato
            </p>
            <p>{customer.phone ? formatPhone(customer.phone) : "—"}</p>
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

      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-wide uppercase">
          Histórico de pedidos
        </h3>
        {orders.length === 0 ? (
          <EmptyState
            title="Sem pedidos"
            description="Este cliente ainda não finalizou um pedido."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
                <TableHead>Status</TableHead>
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
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDateTime(order.createdAtISO)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(order.total)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {order.points}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
