"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pill, ShoppingCart, Trophy } from "lucide-react";

import { COMPANY } from "@/data/company";
import { useCart } from "@/features/cart/useCart";
import { ThemeToggle } from "@/components/theme-toggle";
import { Container } from "./Container";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Catálogo", icon: Pill },
  { href: "/ranking", label: "Ranking", icon: Trophy },
] as const;

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Pill className="size-4" />
          </span>
          <span className="hidden sm:inline">{COMPANY.name}</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
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
        </nav>
      </Container>
    </header>
  );
}
