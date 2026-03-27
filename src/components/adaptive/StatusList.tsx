import { CheckCircle, AlertCircle, XCircle, Clock, Zap, Circle } from "lucide-react";
import type { ComponentRenderProps } from "@openuidev/react-lang";
import { cn } from "../../lib/utils";

const ICONS: Record<string, typeof CheckCircle> = {
  success: CheckCircle, warning: AlertCircle, error: XCircle,
  pending: Clock, active: Zap, default: Circle,
};

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  success: { dot: "text-success", text: "text-success", bg: "bg-success/10" },
  warning: { dot: "text-warning", text: "text-warning", bg: "bg-warning/10" },
  error: { dot: "text-destructive", text: "text-destructive", bg: "bg-destructive/10" },
  pending: { dot: "text-muted-foreground", text: "text-muted-foreground", bg: "bg-muted" },
  active: { dot: "text-primary", text: "text-primary", bg: "bg-primary/10" },
  info: { dot: "text-cyan", text: "text-cyan", bg: "bg-cyan/10" },
  violet: { dot: "text-violet", text: "text-violet", bg: "bg-violet/10" },
  fuchsia: { dot: "text-fuchsia", text: "text-fuchsia", bg: "bg-fuchsia/10" },
  rose: { dot: "text-rose", text: "text-rose", bg: "bg-rose/10" },
  emerald: { dot: "text-emerald", text: "text-emerald", bg: "bg-emerald/10" },
};

interface StatusItem {
  label: string;
  status: string;
  value?: string;
  description?: string;
}

interface StatusListProps {
  title?: string;
  items: StatusItem[];
}

export function StatusListComponent({ props }: ComponentRenderProps<StatusListProps>) {
  const { title, items } = props;

  return (
    <div className="rounded-xl border border-border bg-card">
      {title && (
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-border">
        {items?.map((item, i) => {
          const s = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
          const Icon = ICONS[item.status] ?? ICONS.default;
          return (
            <div key={i} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/20">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", s.bg)}>
                <Icon className={cn("h-4 w-4", s.dot)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  {item.value && (
                    <span className={cn("text-sm font-bold tabular-nums", s.text)}>{item.value}</span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
