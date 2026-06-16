"use client";

import { TriangleAlert } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container className="py-16">
      <EmptyState
        icon={<TriangleAlert />}
        title="Algo deu errado"
        description="Não foi possível carregar agora. Tente novamente em instantes."
        action={
          <Button onClick={reset} variant="outline">
            Tentar de novo
          </Button>
        }
      />
    </Container>
  );
}
