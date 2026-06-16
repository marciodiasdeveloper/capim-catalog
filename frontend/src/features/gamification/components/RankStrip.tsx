/** Faixa "Você está em Nº lugar" (apresentacional). */
export function RankStrip({
  position,
  pontos,
  pedidos,
}: {
  position: number;
  pontos: number;
  pedidos: number;
}) {
  return (
    <div className="border-border bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
      <span>
        Você está em <strong className="text-foreground">{position}º</strong>{" "}
        lugar
      </span>
      <span className="tabular-nums">
        <strong className="text-foreground">{pontos}</strong> pts · {pedidos}{" "}
        pedidos
      </span>
    </div>
  );
}
