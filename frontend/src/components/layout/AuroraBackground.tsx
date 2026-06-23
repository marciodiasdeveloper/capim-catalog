/**
 * Fundo decorativo da home: "aurora" (blobs radiais suaves nas cores de saúde
 * da marca) sobre um pontilhado fraco com máscara que some nas bordas. 100% CSS
 * (sem framer-motion), theme-aware via `dark:`, e `aria-hidden` por ser puramente
 * estético. O drift dos blobs é neutralizado pelo bloco `prefers-reduced-motion`
 * global (globals.css), então ficam estáticos para quem reduz movimento.
 *
 * Posicionado em `fixed inset-0 -z-10`: pinta acima do `bg-background` do body e
 * abaixo do conteúdo. `overflow-hidden` + `pointer-events-none` garantem que os
 * blobs não geram scroll horizontal nem capturam cliques.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Pontilhado clínico, esmaecido nas bordas. */}
      <div
        className="absolute inset-0 text-foreground opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 35%, black, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 35%, black, transparent 72%)",
        }}
      />

      {/* Blob azul — canto superior esquerdo. */}
      <div
        className="animate-aurora-1 absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full opacity-[0.12] blur-[110px] dark:opacity-25"
        style={{ background: "#3b82f6" }}
      />
      {/* Blob ciano — canto superior direito. */}
      <div
        className="animate-aurora-2 absolute -top-24 -right-40 h-[30rem] w-[30rem] rounded-full opacity-[0.10] blur-[110px] dark:opacity-20"
        style={{ background: "#06b6d4" }}
      />
      {/* Blob verde — base, ao centro. */}
      <div
        className="animate-aurora-3 absolute -bottom-48 left-1/3 h-[32rem] w-[32rem] rounded-full opacity-[0.08] blur-[120px] dark:opacity-[0.18]"
        style={{ background: "#22c55e" }}
      />
    </div>
  );
}
