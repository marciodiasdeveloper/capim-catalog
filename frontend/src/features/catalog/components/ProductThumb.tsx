import type { Category } from "@/types";
import { CategoryIcon } from "../CategoryIcon";
import { cn } from "@/lib/utils";

/** Thumb gerado por categoria (sem depender de imagens reais). */
export function ProductThumb({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-lg",
        className
      )}
      style={{ backgroundColor: `${category.accent}22`, color: category.accent }}
      aria-hidden
    >
      <CategoryIcon icon={category.icon} className="size-6" />
    </div>
  );
}
