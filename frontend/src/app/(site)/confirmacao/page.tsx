import type { Metadata } from "next";

import { COMPANY } from "@/data/company";
import { ConfirmationScreen } from "@/screens/ConfirmationScreen";

export const metadata: Metadata = {
  title: `Pedido recebido — ${COMPANY.name}`,
};

export default function ConfirmacaoPage() {
  return <ConfirmationScreen />;
}
