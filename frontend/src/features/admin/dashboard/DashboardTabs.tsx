"use client";

import type { ReactNode } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface DashboardTabItem {
  value: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

/** Valores válidos para `?tab=` — `operacao` é o default (some da URL). */
const TAB_VALUES = ["operacao", "vendas", "trafego", "clientes"] as const;
type TabValue = (typeof TAB_VALUES)[number];

const tabParser = parseAsStringLiteral(TAB_VALUES)
  .withDefault("operacao")
  .withOptions({ history: "replace", scroll: false });

/**
 * Abas da dashboard com a aba ativa sincronizada na URL (`?tab=`) via nuqs.
 * Update é shallow (não re-roda o server component → sem refetch das queries) e
 * sobrevive a refresh / sair e voltar. Os painéis inativos são desmontados
 * (keepMounted=false padrão do base-ui), o que evita gráficos Recharts com
 * altura zero ao montar dentro de container escondido.
 */
export function DashboardTabs({ tabs }: { tabs: DashboardTabItem[] }) {
  const [tab, setTab] = useQueryState("tab", tabParser);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as TabValue)}
      className="gap-6"
    >
      <TabsList variant="line" className="w-full justify-start">
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="flex-none">
            {t.icon}
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
