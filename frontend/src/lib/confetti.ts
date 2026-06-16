/** Celebração com confetti (client-only). Respeita "reduzir movimento". */

import confetti from "canvas-confetti";

/** Uma rajada sutil de confetti, disparada na confirmação do pedido. */
export function celebrate() {
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.3 },
    disableForReducedMotion: true,
  });
}
