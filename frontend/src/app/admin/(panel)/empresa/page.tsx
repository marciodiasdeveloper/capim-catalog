import { getCompany } from "@/server/company";
import { updateCompany } from "@/server/admin/company-actions";
import { CompanyForm } from "@/features/admin/components/CompanyForm";
import { SectionTitle } from "@/components/ui/section-title";

export default async function AdminCompanyPage() {
  const company = await getCompany();

  return (
    <div className="space-y-6">
      <SectionTitle
        as="h1"
        description="Dados da empresa exibidos no site, no header e no checkout."
      >
        Empresa
      </SectionTitle>
      <CompanyForm action={updateCompany} company={company} />
    </div>
  );
}
