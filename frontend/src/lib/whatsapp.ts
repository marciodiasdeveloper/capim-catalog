/** Geração da mensagem do pedido e do link wa.me. Funções puras. */

import type { Order } from "@/types";
import type { Company } from "@/data/company";
import { formatBRL } from "./format";
import { FRETE_GRATIS_ACIMA } from "@/constants";

/** Rótulo do frete: valor, "Grátis" (acima do limite) ou "Sem frete" (retirada). */
function freteLabel(order: Order): string {
  if (order.frete > 0) return formatBRL(order.frete);
  return order.subtotal >= FRETE_GRATIS_ACIMA ? "Grátis" : "Sem frete";
}

/** Monta o texto do pedido para envio no WhatsApp, espelhando o resumo da confirmação. */
export function buildOrderMessage(order: Order, company: Company): string {
  const c = order.customer;
  const lines: string[] = [];

  if (company.atendente) {
    lines.push(`Olá, ${company.atendente}!`);
    lines.push("");
  }

  lines.push(`*Pedido #${order.id}* — ${company.name}`);
  lines.push(`*Cliente:* ${c.nome}`);
  if (c.cpf) lines.push(`*CPF:* ${c.cpf}`);
  if (c.telefone) lines.push(`*Telefone:* ${c.telefone}`);

  lines.push(`*Endereço:*`);
  lines.push(`${c.rua}, ${c.numero}`);
  if (c.complemento) lines.push(c.complemento);
  if (c.bairro) lines.push(c.bairro);
  lines.push(`${c.cidade} / ${c.uf}`);
  if (c.cep) lines.push(`CEP ${c.cep}`);

  lines.push(`*Itens:*`);
  for (const item of order.items) {
    const tipo = item.isWholesale ? "Atacado" : "Varejo";
    lines.push(
      `• ${item.qty}x ${item.name} (${tipo}) — ${formatBRL(item.unitPrice)} (${formatBRL(item.lineTotal)})`
    );
  }

  if (order.delivery) {
    lines.push(`*Entrega:* ${order.delivery.label} (${freteLabel(order)})`);
  }

  lines.push(`*Subtotal:* ${formatBRL(order.subtotal)}`);
  if (order.discount > 0) {
    const couponLabel = order.couponCode ? ` (${order.couponCode})` : "";
    lines.push(`*Desconto${couponLabel}:* -${formatBRL(order.discount)}`);
  }
  lines.push(`*Frete:* ${freteLabel(order)}`);
  lines.push(`*Total:* ${formatBRL(order.total)}`);

  if (c.observacao) lines.push(`*Obs.:* ${c.observacao}`);

  return lines.join("\n");
}

/**
 * Mensagem curta de cobrança para um pedido em aberto (pendente), enviada ao
 * cliente pelo admin a partir do dashboard. Função pura.
 */
export function buildOpenOrderWhatsappMessage(
  order: { number: number; customerName: string; total: number },
  company: Company
): string {
  const lines: string[] = [];
  lines.push(`Olá, ${order.customerName}! 👋`);
  lines.push("");
  lines.push(
    `Passando para lembrar do seu *Pedido #${order.number}* na ${company.name}, no valor de *${formatBRL(order.total)}*, que está com pagamento pendente.`
  );
  lines.push("");
  lines.push("Para concluir, é só fazer o PIX:");
  lines.push(`*${company.pix.chaveTipo}:* ${company.pix.chave}`);
  lines.push(`*Titular:* ${company.pix.titular}`);
  lines.push("");
  lines.push("Depois envie o comprovante por aqui. Qualquer dúvida, estou à disposição!");
  return lines.join("\n");
}

/** Link de deep-link do WhatsApp. `phoneDigits` deve conter DDI+DDD+número (só dígitos). */
export function buildWaLink(phoneDigits: string, text: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
}
