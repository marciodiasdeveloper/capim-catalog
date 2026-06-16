import Link from "next/link";
import { Pill } from "lucide-react";

import { COMPANY } from "@/data/company";
import { requireAdmin } from "@/lib/supabase/auth";
import { signOutAdmin } from "@/server/admin/auth-actions";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

/** Layout protegido do admin. Redireciona ao login se não for admin. */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <Pill className="size-4" />
            </span>
            <span className="hidden sm:inline">
              Admin <span className="text-muted-foreground">· {COMPANY.name}</span>
            </span>
          </Link>

          <AdminNav />

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              Ver site
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
        <Container className="py-8">{children}</Container>
      </main>
    </div>
  );
}
