import { getCompany } from "@/server/company";
import { updateSettings } from "@/server/admin/settings-actions";
import { SettingsForm } from "@/features/admin/components/SettingsForm";
import { SectionTitle } from "@/components/ui/section-title";

export default async function AdminSettingsPage() {
  const company = await getCompany();

  return (
    <div className="space-y-6">
      <SectionTitle
        as="h1"
        description="Funcionalidades do site (chaves liga/desliga)."
      >
        Configurações
      </SectionTitle>
      <SettingsForm action={updateSettings} company={company} />
    </div>
  );
}
