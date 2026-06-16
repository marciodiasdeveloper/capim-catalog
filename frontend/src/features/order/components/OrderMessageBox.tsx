import { Textarea } from "@/components/ui/textarea";

/** Pré-visualização (somente leitura) da mensagem do pedido. */
export function OrderMessageBox({ message }: { message: string }) {
  return (
    <Textarea
      readOnly
      value={message}
      rows={12}
      aria-label="Resumo do pedido para o WhatsApp"
      className="resize-none font-mono text-xs leading-relaxed"
    />
  );
}
