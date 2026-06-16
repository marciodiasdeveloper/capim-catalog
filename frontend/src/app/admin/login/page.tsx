import type { Metadata } from "next";

import { COMPANY } from "@/data/company";
import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `Admin — ${COMPANY.name}`,
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4">
          <div className="space-y-1 text-center">
            <h1 className="text-lg font-bold">Admin · {COMPANY.name}</h1>
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
