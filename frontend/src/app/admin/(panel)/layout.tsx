import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Store } from "lucide-react";

import { getCompany } from "@/server/company";
import { requireAdmin } from "@/lib/supabase/auth";
import { signOutAdmin } from "@/server/admin/auth-actions";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { Container } from "@/components/layout/Container";
import { CompanyLogo } from "@/components/layout/CompanyLogo";
import { Button } from "@/components/ui/button";

/** Layout protegido do admin. Redireciona ao login se não for admin. */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, company] = await Promise.all([requireAdmin(), getCompany()]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 font-bold"
          >
            <CompanyLogo logoUrl={company.logoUrl} name={company.name} />
            <span className="hidden sm:inline">{company.name}</span>
          </Link>

          <AdminNav />

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              aria-label="Ver site"
              title="Ver site"
              className="text-muted-foreground hover:text-foreground hidden items-center sm:inline-flex"
            >
              <Store className="size-5" />
            </Link>
            <span className="text-muted-foreground hidden md:inline">
              {admin.email}
            </span>
            <form action={signOutAdmin}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Container className="py-8">
          <NuqsAdapter>{children}</NuqsAdapter>
        </Container>
      </main>
    </div>
  );
}
