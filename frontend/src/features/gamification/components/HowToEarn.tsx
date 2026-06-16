import { Award, Coins, Trophy } from "lucide-react";

import { POINT_RULES } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";

const RULE_ICONS = [Coins, Award, Trophy];

/** Explica como ganhar pontos no ranking do mês. */
export function HowToEarn() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold tracking-wide uppercase">
        Como ganhar pontos
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {POINT_RULES.map((rule, index) => {
          const Icon = RULE_ICONS[index] ?? Coins;
          return (
            <Card key={rule.title} size="sm">
              <CardContent className="space-y-2">
                <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </span>
                <p className="text-sm font-semibold">{rule.title}</p>
                <p className="text-muted-foreground text-xs">
                  {rule.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
