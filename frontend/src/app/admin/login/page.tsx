import type { Metadata } from "next";

import { getCompany } from "@/server/company";
import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return {
    title: `Admin — ${company.name}`,
  };
}

export default async function AdminLoginPage() {
  const company = await getCompany();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4">
          <div className="space-y-1 text-center">
            <h1 className="text-lg font-bold">Admin · {company.name}</h1>
            <p className="text-muted-foreground text-sm">
              Entre para gerenciar o catálogo.
            </p>
          </div>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
