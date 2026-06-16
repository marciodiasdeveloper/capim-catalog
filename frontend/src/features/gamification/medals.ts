/** Apoios visuais do ranking (medalhas e cor por posição). */

export const MEDALS = ["🥇", "🥈", "🥉"] as const;

/** Retorna a medalha da posição (1-based) ou string vazia. */
export function medalFor(position: number): string {
  return MEDALS[position - 1] ?? "";
}

/** Cor de destaque por posição do pódio. */
export function podiumColor(position: number): string {
  switch (position) {
    case 1:
      return "#f5b50a"; // ouro
    case 2:
      return "#c0c7d1"; // prata
    case 3:
      return "#cd7f32"; // bronze
    default:
      return "#64748b";
  }
}
