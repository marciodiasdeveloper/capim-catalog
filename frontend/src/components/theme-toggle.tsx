"use client";

import { useTheme } from "next-themes";
import { Menu } from "@base-ui/react/menu";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

/** Seletor de tema (claro/escuro/sistema) no header. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // No SSR e na 1ª renderização do cliente `theme` é undefined (next-themes só
  // resolve após montar) → ícone neutro, consistente nos dois lados (sem mismatch).
  const TriggerIcon =
    theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Alternar tema"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground"
        )}
      >
        <TriggerIcon className="size-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="isolate z-50"
        >
          <Menu.Popup className="origin-(--transform-origin) min-w-36 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <Menu.Item
                key={value}
                onClick={() => setTheme(value)}
                className="relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                <Icon className="size-4" />
                {label}
                {theme === value && (
                  <Check className="absolute right-2 size-4" />
                )}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
