import type { RankedUser } from "@/data/ranking";
import { shortName } from "@/lib/format";
import { medalFor, podiumColor } from "../medals";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Card de destaque para um colocado do pódio (top 3). */
export function PodiumCard({ user }: { user: RankedUser }) {
  const color = podiumColor(user.position);
  const isChampion = user.position === 1;

  return (
    <Card
      className={cn(
        "items-center gap-2 py-5 text-center",
        isChampion && "ring-2",
        user.isCurrent && "bg-primary/5"
      )}
      style={isChampion ? { boxShadow: `0 0 0 2px ${color}55` } : undefined}
    >
      <div className="text-2xl">{medalFor(user.position)}</div>
      <UserAvatar
        name={user.name}
        color={user.avatarColor}
        className={cn("size-14 text-base", isChampion && "size-16")}
      />
      <div>
        <p className="font-semibold">{shortName(user.name)}</p>
        <p className="text-muted-foreground text-xs">{user.cidade}</p>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="font-bold tabular-nums" style={{ color }}>
          {user.pontos} pts
        </span>
        <span className="text-muted-foreground tabular-nums">
          {user.pedidos} pedidos
        </span>
      </div>
      {user.isCurrent && (
        <span className="text-primary text-xs font-medium">Você</span>
      )}
    </Card>
  );
}
