import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

import type { RankedUser } from "@/data/ranking";
import { currentMonthLabel, shortName } from "@/lib/format";
import { medalFor } from "../medals";
import { MyRankStrip } from "./MyRankStrip";
import { RankStrip } from "./RankStrip";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card } from "@/components/ui/card";

interface RankingBannerProps {
  top: RankedUser[];
  currentRank?: RankedUser | null;
}

/** Faixa de ranking exibida no topo do catálogo. */
export function RankingBanner({ top, currentRank }: RankingBannerProps) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-warning/15 text-warning flex size-9 items-center justify-center rounded-lg">
            <Trophy className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide uppercase">
              Ranking do mês
            </p>
            <p className="text-muted-foreground text-xs">{currentMonthLabel()}</p>
          </div>
        </div>

        {top.length > 0 ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {top.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <span className="relative">
                  <UserAvatar
                    name={user.name}
                    color={user.avatarColor}
                    className="size-8"
                  />
                  {user.position <= 3 && (
                    <span className="absolute -right-1.5 -bottom-1.5 text-sm">
                      {medalFor(user.position)}
                    </span>
                  )}
                </span>
                <div className="hidden md:block">
                  <p className="text-xs font-medium">{shortName(user.name)}</p>
                  <p className="text-muted-foreground text-[11px] tabular-nums">
                    {user.pontos} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Seja o primeiro a pontuar este mês!
          </p>
        )}

        <Link
          href="/ranking"
          className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Ver ranking <ChevronRight className="size-4" />
        </Link>
      </div>

      {currentRank ? (
        <RankStrip
          position={currentRank.position}
          pontos={currentRank.pontos}
          pedidos={currentRank.pedidos}
        />
      ) : (
        <MyRankStrip />
      )}
    </Card>
  );
}
