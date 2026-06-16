import { notFound } from "next/navigation";

import { getAdminCustomer } from "@/server/admin/customer-queries";
import { CustomerEditForm } from "@/features/admin/components/CustomerEditForm";
import { SectionTitle } from "@/components/ui/section-title";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getAdminCustomer(id);
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <SectionTitle description={customer.name}>Editar cliente</SectionTitle>
      <CustomerEditForm customer={customer} />
    </div>
  );
}
