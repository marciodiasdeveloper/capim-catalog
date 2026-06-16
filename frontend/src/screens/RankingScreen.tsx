import { Trophy } from "lucide-react";

import { getMonthlyRanking } from "@/server/orders/ranking";
import { currentMonthLabel } from "@/lib/format";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PodiumCard } from "@/features/gamification/components/PodiumCard";
import { RankingTable } from "@/features/gamification/components/RankingTable";
import { HowToEarn } from "@/features/gamification/components/HowToEarn";

/** Tela do ranking mensal: pódio + tabela completa + regras de pontos. */
export async function RankingScreen() {
  const ranked = await getMonthlyRanking();
  const podium = ranked.slice(0, 3);

  return (
    <Container className="space-y-8 py-8">
      <SectionTitle
        description={`Os clientes que mais pontuaram em ${currentMonthLabel()}.`}
      >
        Ranking do mês
      </SectionTitle>

      {ranked.length === 0 ? (
        <EmptyState
          icon={<Trophy />}
          title="Ainda sem pontuações neste mês"
          description="Os primeiros pedidos do mês aparecem aqui."
        />
      ) : (
        <>
          <div className="animate-in fade-in slide-in-from-bottom-2 grid gap-4 duration-500 sm:grid-cols-3">
            {podium.map((user) => (
              <PodiumCard key={user.id} user={user} />
            ))}
          </div>

          <Card
            className="animate-in fade-in slide-in-from-bottom-2 px-2 duration-500"
            style={{ animationDelay: "100ms", animationFillMode: "both" }}
          >
            <RankingTable users={ranked} />
          </Card>

          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <HowToEarn />
          </div>
        </>
      )}
    </Container>
  );
}
