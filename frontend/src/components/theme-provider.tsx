"use client";

import type { ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Provider de tema (next-themes). Controla a classe `dark`/`light` no <html>.
 *
 * Este Next.js (16) lança erro de console quando um componente renderiza uma
 * tag <script> no cliente. O next-themes injeta um script anti-flash; aplicamos
 * o padrão recomendado pela doc ("preventing-flash-before-hydration"): `type`
 * "text/javascript" no servidor (executa antes do paint) e "text/plain" no
 * cliente (React ignora, sem erro). O `typeof window` precisa ser avaliado
 * **aqui** (componente cliente) para reavaliar na hidratação — se viesse do
 * layout (server), o valor seria serializado e nunca alternaria.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{
        type: typeof window === "undefined" ? "text/javascript" : "text/plain",
      }}
    >
      {children}
    </NextThemesProvider>
  );
}
