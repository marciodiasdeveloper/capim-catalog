import { Pill } from "lucide-react";

/**
 * Marca da empresa no header: mostra o logo enviado (se houver) ou o ícone
 * padrão. Sem hooks — serve tanto a Server quanto a Client Components.
 */
export function CompanyLogo({
  logoUrl,
  name,
}: {
  logoUrl: string | null;
  name: string;
}) {
  return (
    <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center overflow-hidden rounded-lg">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="size-full object-cover" />
      ) : (
        <Pill className="size-4" />
      )}
    </span>
  );
}
