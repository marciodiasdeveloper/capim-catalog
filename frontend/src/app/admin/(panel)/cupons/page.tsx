import Link from "next/link";
import { Plus, SquarePen, Tag } from "lucide-react";

import { getAdminCoupons } from "@/server/admin/coupon-queries";
import { deleteCoupon } from "@/server/admin/coupon-actions";
import { formatBRL } from "@/lib/format";
import { ConfirmDeleteButton } from "@/features/admin/components/ConfirmDeleteButton";
import { SectionTitle } from "@/components/ui/section-title";
import { Badge } from "@/components/ui/badge";
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

export default async function CouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-4">
      <SectionTitle
        as="h1"
        description={`${coupons.length} cupom(ns).`}
        action={
          <Link
            href="/admin/cupons/novo"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus /> Novo cupom
          </Link>
        }
      >
        Cupons
      </SectionTitle>

      {coupons.length === 0 ? (
        <EmptyState
          icon={<Tag />}
          title="Nenhum cupom"
          description="Crie cupons de desconto para aparecerem no checkout."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Regras</TableHead>
              <TableHead className="text-right">Usos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div className="font-mono font-medium">{coupon.code}</div>
                  <div className="text-muted-foreground text-xs">
                    {coupon.description || coupon.id}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : formatBRL(coupon.discountValue)}
                  {coupon.discountType === "percentage" &&
                    coupon.maxDiscount !== null && (
                      <span className="text-muted-foreground text-xs">
                        {" "}
                        (até {formatBRL(coupon.maxDiscount)})
                      </span>
                    )}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {coupon.minItems > 0 && <div>mín {coupon.minItems} itens</div>}
                  {coupon.minSubtotal > 0 && (
                    <div>mín {formatBRL(coupon.minSubtotal)}</div>
                  )}
                  {coupon.minItems === 0 && coupon.minSubtotal === 0 && (
                    <span>—</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {coupon.currentUses}
                  {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                </TableCell>
                <TableCell>
                  {coupon.active ? (
                    <Badge variant="outline" className="text-success">
                      ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/cupons/${coupon.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      <SquarePen /> Editar
                    </Link>
                    <ConfirmDeleteButton
                      action={deleteCoupon.bind(null, coupon.id)}
                      confirmMessage={`Excluir o cupom "${coupon.code}"?`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
