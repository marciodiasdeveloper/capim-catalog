import { Badge } from "@/components/ui/badge";
import { AGING_META, classifyAging } from "./aging";

/** Badge de severidade pela idade do pedido em aberto (proxy: created_at). */
export function AgingBadge({ createdAtISO }: { createdAtISO: string }) {
  const meta = AGING_META[classifyAging(createdAtISO)];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
}
