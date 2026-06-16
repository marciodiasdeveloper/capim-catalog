import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  "Pague via PIX com os dados abaixo",
  "Envie o resumo do pedido pelo nosso WhatsApp",
  "Envie também o comprovante de pagamento no mesmo WhatsApp",
];

/** Lista numerada de passos para finalizar o pedido. */
export function PaymentSteps() {
  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="text-sm font-semibold">Para finalizar seu pedido:</p>
        <ol className="space-y-2.5">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className="bg-primary/15 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
