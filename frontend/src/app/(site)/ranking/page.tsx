import type { Metadata } from "next";

import { getCompany } from "@/server/company";
import { RankingScreen } from "@/screens/RankingScreen";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return {
    title: `Ranking do mês — ${company.name}`,
  };
}

export default function RankingPage() {
  return <RankingScreen />;
}
