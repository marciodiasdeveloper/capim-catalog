import type { RankedUser } from "@/data/ranking";
import { medalFor } from "../medals";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Tabela completa do ranking, destacando o usuário atual. */
export function RankingTable({ users }: { users: RankedUser[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">#</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Pedidos</TableHead>
          <TableHead className="text-right">Pontos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className={cn(user.isCurrent && "bg-primary/10 hover:bg-primary/15")}
          >
            <TableCell className="font-medium tabular-nums">
              <span className="inline-flex items-center gap-1">
                {user.position}
                {medalFor(user.position)}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={user.name}
                  color={user.avatarColor}
                  className="size-8"
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="truncate">{user.name}</span>
                    {user.isCurrent && (
                      <Badge variant="outline" className="text-primary">
                        Você
                      </Badge>
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">{user.cidade}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {user.pedidos}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {user.pontos}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
