"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <EmptyState
      icon={<TriangleAlert />}
      title="Erro ao carregar"
      description={error.message || "Falha ao acessar os dados. Tente novamente."}
      action={
        <Button onClick={reset} variant="outline">
          Tentar de novo
        </Button>
      }
    />
  );
}
