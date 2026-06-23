import { MessageCircle, QrCode, Trophy, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Company } from "@/data/company";
import { FRETE_GRATIS_ACIMA } from "@/constants";
import { formatBRL } from "@/lib/format";

export interface Highlight {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/**
 * Selos de confiança da loja (frete grátis, PIX, atendimento e — quando a
 * gamificação está ligada — ranking). Fonte única consumida pelo rodapé e pela
 * faixa de confiança da home, para não duplicar a regra de exibição.
 */
export function getHighlights(company: Company): Highlight[] {
  return [
    {
      icon: Truck,
      title: "Frete grátis",
      desc: `acima de ${formatBRL(FRETE_GRATIS_ACIMA)}`,
    },
    { icon: QrCode, title: "Pague com PIX", desc: "rápido e sem taxas" },
    { icon: MessageCircle, title: "Atendimento humano", desc: "pelo WhatsApp" },
    ...(company.gamificationEnabled
      ? [
          {
            icon: Trophy,
            title: "Ranking do mês",
            desc: "pontos a cada pedido",
          },
        ]
      : []),
  ];
}
