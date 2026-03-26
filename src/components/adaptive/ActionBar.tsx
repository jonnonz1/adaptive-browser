import type { ComponentRenderProps } from "@openuidev/react-lang";
import { useTriggerAction } from "@openuidev/react-lang";

interface ActionDef {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  confirmMessage?: string;
}

interface ActionBarProps {
  actions: ActionDef[];
}

export function ActionBarComponent({ props }: ComponentRenderProps<ActionBarProps>) {
  const triggerAction = useTriggerAction();
  const { actions } = props;

  const handleClick = (action: ActionDef) => {
    if (action.confirmMessage && !window.confirm(action.confirmMessage)) {
      return;
    }
    triggerAction(action.label, undefined, {
      type: action.label.toLowerCase().replace(/\s+/g, "_"),
    });
  };

  return (
    <div className="flex gap-2">
      {actions?.map((action, i) => (
        <button
          key={i}
          onClick={() => handleClick(action)}
          className="rounded px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor:
              action.variant === "danger"
                ? "var(--color-danger)"
                : action.variant === "primary"
                ? "var(--color-accent)"
                : "var(--color-bg-tertiary)",
            color:
              action.variant === "secondary"
                ? "var(--color-text-primary)"
                : "var(--color-bg-primary)",
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
