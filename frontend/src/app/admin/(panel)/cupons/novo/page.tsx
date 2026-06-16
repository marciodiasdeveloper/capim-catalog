import { createCoupon } from "@/server/admin/coupon-actions";
import { CouponForm } from "@/features/admin/components/CouponForm";
import { SectionTitle } from "@/components/ui/section-title";

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <SectionTitle>Novo cupom</SectionTitle>
      <CouponForm mode="create" action={createCoupon} />
    </div>
  );
}
