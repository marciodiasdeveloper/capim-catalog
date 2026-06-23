"use client";

import { useCompany } from "@/features/company/CompanyContext";
import { getHighlights } from "@/components/layout/highlights";

/**
 * Faixa enxuta no topo da home: proposta de valor (tagline) + selos de
 * confiança em "vidro fosco" sobre o fundo aurora. Os selos vêm de
 * `getHighlights` — a mesma fonte do rodapé. Não usa `<h1>` para preservar a
 * hierarquia (o h1 da página é o "Monte seu pedido" do catálogo).
 */
export function CatalogHero() {
  const company = useCompany();
  const highlights = getHighlights(company);

  return (
    <section className="border-border bg-card/40 flex flex-col gap-4 rounded-2xl border p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="space-y-1">
        <p className="text-lg font-semibold tracking-tight sm:text-xl">
          {company.tagline}
        </p>
        <p className="text-muted-foreground text-sm">
          Pedidos pelo WhatsApp, pagamento via PIX.
        </p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {highlights.map(({ icon: Icon, title }) => (
          <li
            key={title}
            className="border-border bg-background/60 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
          >
            <Icon className="text-primary size-3.5" />
            {title}
          </li>
        ))}
      </ul>
    </section>
  );
}
