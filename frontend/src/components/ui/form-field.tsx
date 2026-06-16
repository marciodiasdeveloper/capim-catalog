import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id?: string;
  label: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Campo de formulário: rótulo + controle + mensagem de erro. */
export function FormField({
  id,
  label,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <Label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
