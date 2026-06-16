import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** `<select>` nativo estilizado como os inputs (bom para envio via form action). */
export function NativeSelect({
  className,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3",
        className
      )}
      {...props}
    />
  );
}
