"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AdminNav() {
  const pathname = usePathname();
  const isPedidos = pathname.startsWith("/admin/pedidos");
  const isClientes = pathname.startsWith("/admin/clientes");
  const isCupons = pathname.startsWith("/admin/cupons");
  const isEmpresa = pathname.startsWith("/admin/empresa");

  const links = [
    {
      href: "/admin",
      label: "Catálogo",
      active: !isPedidos && !isClientes && !isCupons && !isEmpresa,
    },
    { href: "/admin/pedidos", label: "Pedidos", active: isPedidos },
    { href: "/admin/clientes", label: "Clientes", active: isClientes },
    { href: "/admin/cupons", label: "Cupons", active: isCupons },
    { href: "/admin/empresa", label: "Empresa", active: isEmpresa },
  ];

  return (
    <nav className="flex items-center gap-1 text-sm">
      {links.map(({ href, label, active }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-1.5 font-medium transition-colors",
            active && "bg-muted text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
