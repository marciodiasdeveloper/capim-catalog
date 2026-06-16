import type { Metadata } from "next";

import { getCompany } from "@/server/company";
import { ConfirmationScreen } from "@/screens/ConfirmationScreen";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return {
    title: `Pedido recebido — ${company.name}`,
  };
}

export default function ConfirmacaoPage() {
  return <ConfirmationScreen />;
}
