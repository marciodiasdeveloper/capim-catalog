import {
  Bandage,
  HeartPulse,
  Leaf,
  Pill,
  Sparkles,
  Thermometer,
} from "lucide-react";

/**
 * Renderiza o ícone da categoria a partir da sua chave.
 * Declarado em escopo de módulo (sem componentes dinâmicos em render).
 */
export function CategoryIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  switch (icon) {
    case "thermometer":
      return <Thermometer className={className} />;
    case "leaf":
      return <Leaf className={className} />;
    case "heart-pulse":
      return <HeartPulse className={className} />;
    case "bandage":
      return <Bandage className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "pill":
    default:
      return <Pill className={className} />;
  }
}
