"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Pill, ShoppingCart, Trophy } from "lucide-react";

import { useCart } from "@/features/cart/useCart";
import { useCompany } from "@/features/company/CompanyContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { Container } from "./Container";
import { CompanyLogo } from "./CompanyLogo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Catálogo", icon: Pill },
  { href: "/ranking", label: "Ranking", icon: Trophy },
] as const;

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { count } = useCart();
  const company = useCompany();

  // Esconde o link de Ranking quando a Gamificação está desativada.
  const navLinks = company.gamificationEnabled
    ? NAV_LINKS
    : NAV_LINKS.filter((link) => link.href !== "/ranking");

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <CompanyLogo logoUrl={company.logoUrl} name={company.name} />
          <span className="hidden flex-col leading-tight sm:flex">
            <span>{company.name}</span>
            {company.tagline && (
              <span className="text-muted-foreground text-[11px] font-normal">
                {company.tagline}
              </span>
            )}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href && "bg-muted text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          {isAdmin && pathname === "/" && (
            <Link
              href="/admin/dashboard"
              aria-label="Voltar ao admin"
              title="Voltar ao admin"
              className="text-primary hover:bg-muted inline-flex items-center rounded-lg px-3 py-1.5 transition-colors"
            >
              <LayoutDashboard className="size-4" />
            </Link>
          )}

          <ThemeToggle />

          <Link
            href="/#resumo"
            aria-label={
              count > 0 ? `Ver resumo do pedido (${count} itens)` : "Ver resumo do pedido"
            }
            className="text-muted-foreground hover:bg-muted hover:text-foreground relative inline-flex items-center rounded-lg px-3 py-1.5 transition-colors"
          >
            <ShoppingCart className="size-4" />
            {count > 0 && (
              <span
                key={count}
                aria-hidden="true"
                className="bg-primary text-primary-foreground animate-in zoom-in-50 absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums duration-300"
              >
                {count}
              </span>
            )}
          </Link>

          {/* Região viva: anuncia a mudança de quantidade do pedido a leitores de tela. */}
          <span aria-live="polite" className="sr-only">
            {count > 0
              ? `${count} ${count === 1 ? "item" : "itens"} no pedido`
              : ""}
          </span>
        </nav>
      </Container>
    </header>
  );
}
