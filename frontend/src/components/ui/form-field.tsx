import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id?: string;
  label: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Campo de formulário: rótulo + controle + mensagem de erro. Quando há erro, a
 * mensagem é anunciada (`role="alert"`) e associada ao controle via
 * `aria-describedby` (quando o controle é um único elemento).
 */
export function FormField({
  id,
  label,
  error,
  className,
  children,
}: FormFieldProps) {
  const errorId = id && error ? `${id}-error` : undefined;

  // Associa a mensagem ao controle quando children é um único elemento.
  const control =
    errorId && React.isValidElement(children)
      ? React.cloneElement(
          children as React.ReactElement<{ "aria-describedby"?: string }>,
          { "aria-describedby": errorId }
        )
      : children;

  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <Label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </Label>
      {control}
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
