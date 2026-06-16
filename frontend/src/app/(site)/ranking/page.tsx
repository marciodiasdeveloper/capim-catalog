import type { Metadata } from "next";

import { COMPANY } from "@/data/company";
import { RankingScreen } from "@/screens/RankingScreen";

export const metadata: Metadata = {
  title: `Ranking do mês — ${COMPANY.name}`,
};

export default function RankingPage() {
  return <RankingScreen />;
}
