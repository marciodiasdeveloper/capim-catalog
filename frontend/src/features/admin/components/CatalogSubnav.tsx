"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
] as const;

/** Submenu do Catálogo: alterna entre as telas de Produtos e Categorias. */
export function CatalogSubnav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              buttonVariants({
                size: "sm",
                variant: active ? "default" : "outline",
              }),
              "rounded-full"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
