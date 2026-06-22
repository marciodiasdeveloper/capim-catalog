"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { track } from "@/lib/analytics/track";

/**
 * Emite um `page_view` a cada mudança de rota no storefront. Renderiza `null`
 * (não usa <script>, evitando o gotcha do Next 16 modificado). Montado só no
 * layout da loja — o admin não é rastreado.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track({ type: "page_view", path: pathname });
  }, [pathname]);

  return null;
}
