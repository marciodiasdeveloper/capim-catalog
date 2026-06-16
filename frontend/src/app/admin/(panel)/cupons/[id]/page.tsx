import { notFound } from "next/navigation";

import { getAdminCoupon } from "@/server/admin/coupon-queries";
import { updateCoupon } from "@/server/admin/coupon-actions";
import { CouponForm } from "@/features/admin/components/CouponForm";
import { SectionTitle } from "@/components/ui/section-title";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await getAdminCoupon(id);

  if (!coupon) notFound();

  return (
    <div className="space-y-6">
      <SectionTitle description={coupon.code}>Editar cupom</SectionTitle>
      <CouponForm mode="edit" action={updateCoupon} coupon={coupon} />
    </div>
  );
}
