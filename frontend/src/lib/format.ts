/** Formatação e máscaras (pt-BR). Funções puras, sem efeitos colaterais. */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** 000.000.000-00 */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** 00000-000 */
export function formatCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
}

/** (00) 00000-0000 */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

/** Iniciais para avatar (ex.: "Júnior José" -> "JJ"). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Nome curto (ex.: "Júnior José" -> "Júnior J."). */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

interface AddressLike {
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
}

/** Monta as linhas de um endereço, ignorando partes vazias. */
export function formatAddressLines(addr: AddressLike): string[] {
  return [
    addr.rua && `${addr.rua}, ${addr.numero ?? ""}`.trim(),
    addr.complemento,
    addr.bairro,
    [addr.cidade, addr.uf].filter(Boolean).join(" / "),
    addr.cep && `CEP ${addr.cep}`,
  ].filter(Boolean) as string[];
}

/** Data e hora curtas em pt-BR (ex.: "16/06/2026 14:32"). */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Mês atual capitalizado em pt-BR (ex.: "Junho de 2026"). */
export function currentMonthLabel(): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}
