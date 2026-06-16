import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

interface UserAvatarProps {
  name: string;
  /** Cor de fundo (hex). */
  color?: string;
  className?: string;
}

/** Avatar circular com as iniciais do nome sobre uma cor sólida. */
export function UserAvatar({ name, color = "#3b82f6", className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "ring-background inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2",
        className
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
