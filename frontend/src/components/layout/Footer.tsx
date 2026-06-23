import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";

import type { Company } from "@/data/company";
import { formatPhone } from "@/lib/format";
import { buildWaLink } from "@/lib/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "./Container";
import { CompanyLogo } from "./CompanyLogo";
import { getHighlights } from "./highlights";
import { cn } from "@/lib/utils";

const WA_GREETING = "Olá! Vim pelo catálogo e gostaria de fazer um pedido.";

const NAV_LINKS = [
  { href: "/", label: "Catálogo" },
  { href: "/ranking", label: "Ranking" },
  { href: "/#resumo", label: "Meu pedido" },
];

/** Rodapé do storefront: faixa de destaques, marca + contato e barra de copyright. */
export function Footer({ company }: { company: Company }) {
  const year = new Date().getFullYear();
  const waLink = buildWaLink(company.whatsapp, WA_GREETING);
  const phoneLabel = `+55 ${formatPhone(company.whatsapp.replace(/^55/, ""))}`;

  // Esconde as superfícies de gamificação quando a chave está desativada.
  const highlights = getHighlights(company);

  const navLinks = company.gamificationEnabled
    ? NAV_LINKS
    : NAV_LINKS.filter((link) => link.href !== "/ranking");

  return (
    <footer className="border-border bg-card/30 mt-12 border-t">
      <Container className="py-10">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{title}</span>
                <span className="text-muted-foreground block text-xs">
                  {desc}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="border-border my-8 border-t" />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-2">
            <Link href="/" className="flex w-fit items-center gap-2 font-bold">
              <CompanyLogo logoUrl={company.logoUrl} name={company.name} />
              <span>{company.name}</span>
            </Link>
            {company.tagline && (
              <p className="text-muted-foreground max-w-xs text-sm">
                {company.tagline}
              </p>
            )}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants(), "w-fit gap-2")}
            >
              <MessageCircle className="size-4" />
              Falar no WhatsApp
            </a>
          </div>

          <nav aria-label="Rodapé" className="space-y-3">
            <h2 className="text-xs font-bold tracking-wide uppercase">
              Navegação
            </h2>
            <ul className="space-y-2 text-sm">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <ChevronRight className="size-3.5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <h2 className="text-xs font-bold tracking-wide uppercase">
              Atendimento
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="size-4 shrink-0" />
                  {phoneLabel}
                </a>
              </li>
              {company.atendente && (
                <li className="text-muted-foreground">
                  Falar com {company.atendente}
                </li>
              )}
              <li className="text-muted-foreground">
                Pague com PIX na confirmação
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-border border-t">
        <Container className="text-muted-foreground flex flex-col items-center justify-between gap-2 py-5 text-center text-xs sm:flex-row sm:text-left">
          <p>
            © {year} {company.name}
          </p>
          <p>Catálogo online · pagamentos via PIX, pedidos pelo WhatsApp.</p>
        </Container>
      </div>
    </footer>
  );
}
