"use client";

import { useEffect, useState } from "react";

import { getMyMonthlyRank, type MyRank } from "@/server/orders/my-rank";
import { STORAGE_ORDER_REF_KEY } from "@/constants";
import { RankStrip } from "./RankStrip";

/** Busca a posição do cliente pela referência do pedido salva localmente. */
export function MyRankStrip() {
  const [rank, setRank] = useState<MyRank | null>(null);

  useEffect(() => {
    let active = true;
    try {
      const ref = localStorage.getItem(STORAGE_ORDER_REF_KEY);
      if (!ref) return;
      getMyMonthlyRank(ref)
        .then((result) => {
          if (active) setRank(result);
        })
        .catch(() => {});
    } catch {
      /* storage indisponível */
    }
    return () => {
      active = false;
    };
  }, []);

  if (!rank) return null;
  return (
    <RankStrip
      position={rank.position}
      pontos={rank.pontos}
      pedidos={rank.pedidos}
    />
  );
}
