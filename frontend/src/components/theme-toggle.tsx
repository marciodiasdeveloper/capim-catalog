"use client";

import { useSyncExternalStore } from "react";
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

const emptySubscribe = () => () => {};

/** Seletor de tema (claro/escuro/sistema) no header. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Só refletimos o tema resolvido APÓS montar. No servidor e na 1ª render do
  // cliente, `mounted` é false (ícone neutro Monitor nos dois lados) → sem
  // hydration mismatch. useSyncExternalStore evita setState-em-efeito.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const current = mounted ? theme : undefined;
  const TriggerIcon =
    current === "light" ? Sun : current === "dark" ? Moon : Monitor;

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
                {current === value && (
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
