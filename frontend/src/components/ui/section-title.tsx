import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  description?: React.ReactNode;
  /** Conteúdo alinhado à direita (ex.: contador, link). */
  action?: React.ReactNode;
  className?: string;
}

/** Título de seção em caixa alta com tracking, no estilo dos prints ("MONTE SEU PEDIDO"). */
export function SectionTitle({
  children,
  description,
  action,
  className,
}: SectionTitleProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
          {children}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
