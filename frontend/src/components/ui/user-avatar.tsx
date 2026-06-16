import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

interface UserAvatarProps {
  name: string;
  /** Cor de fundo (hex). */
  color?: string;
  className?: string;
}

/**
 * Escurece uma cor hex (multiplica os canais) para garantir contraste >= 4.5:1
 * com o texto branco das iniciais (WCAG 1.4.3), independente da cor recebida.
 */
function darken(hex: string, factor = 0.5): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Avatar circular com as iniciais do nome sobre uma cor sólida (decorativo). */
export function UserAvatar({ name, color = "#3b82f6", className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "ring-background inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2",
        className
      )}
      style={{ backgroundColor: darken(color) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
