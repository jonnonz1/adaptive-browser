import type { ComponentRenderProps } from "@openuidev/react-lang";
import { useTriggerAction } from "@openuidev/react-lang";
import { cn } from "../../lib/utils";

interface ActionDef { label: string; variant?: "primary" | "secondary" | "danger"; confirmMessage?: string; }
interface ActionBarProps { actions: ActionDef[]; }

export function ActionBarComponent({ props }: ComponentRenderProps<ActionBarProps>) {
  const triggerAction = useTriggerAction();

  const handleClick = (a: ActionDef) => {
    if (a.confirmMessage && !window.confirm(a.confirmMessage)) return;
    triggerAction(a.label, undefined, { type: a.label.toLowerCase().replace(/\s+/g, "_") });
  };

  return (
    <div className="flex gap-2">
      {props.actions?.map((a, i) => (
        <button
          key={i}
          onClick={() => handleClick(a)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors active:scale-[0.98]",
            a.variant === "danger" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : a.variant === "primary" ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              : "bg-secondary text-foreground hover:bg-accent"
          )}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
