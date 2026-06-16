/** Celebração com confetti (client-only). Respeita "reduzir movimento". */

/**
 * Dispara uma rajada sutil de confetti na confirmação do pedido. O
 * `canvas-confetti` é carregado sob demanda (import dinâmico) para não pesar no
 * bundle inicial da rota de confirmação.
 */
export async function celebrate(): Promise<void> {
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.3 },
    disableForReducedMotion: true,
  });
}
