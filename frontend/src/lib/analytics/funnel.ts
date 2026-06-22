/** Lógica pura do funil de conversão (sem React/Supabase). Testável. */

export interface FunnelStageInput {
  key: string;
  label: string;
  value: number;
}

export interface FunnelStage extends FunnelStageInput {
  /** Largura da barra: valor relativo ao primeiro estágio (0..100). */
  pctOfTop: number;
  /** Conversão em relação ao estágio anterior (%); null se base zero. */
  stepPct: number | null;
}

/** Arredonda para 1 casa decimal. */
function pct1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Constrói os estágios do funil com largura proporcional ao topo e a conversão
 * passo-a-passo. O primeiro estágio é a base (100% de largura, sem `stepPct`).
 */
export function buildFunnel(stages: FunnelStageInput[]): FunnelStage[] {
  const top = stages[0]?.value ?? 0;
  return stages.map((stage, i) => {
    const prev = i > 0 ? stages[i - 1].value : 0;
    return {
      ...stage,
      pctOfTop: top > 0 ? pct1((stage.value / top) * 100) : 0,
      stepPct: i === 0 ? null : prev > 0 ? pct1((stage.value / prev) * 100) : null,
    };
  });
}

/** Conversão geral: último estágio / primeiro (%). 0 quando não há topo. */
export function overallConversion(stages: FunnelStageInput[]): number {
  const top = stages[0]?.value ?? 0;
  const last = stages[stages.length - 1]?.value ?? 0;
  return top > 0 ? pct1((last / top) * 100) : 0;
}
