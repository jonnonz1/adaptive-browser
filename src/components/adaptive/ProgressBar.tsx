import type { ComponentRenderProps } from "@openuidev/react-lang";

const COLORS: Record<string, string> = {
  blue: "bg-primary", violet: "bg-violet", fuchsia: "bg-fuchsia", rose: "bg-rose",
  orange: "bg-orange", amber: "bg-amber", lime: "bg-lime", emerald: "bg-emerald",
  teal: "bg-teal", cyan: "bg-cyan", sky: "bg-sky", indigo: "bg-indigo",
  pink: "bg-pink", green: "bg-success", red: "bg-destructive", yellow: "bg-warning",
};

const GLOWS: Record<string, string> = {
  blue: "shadow-primary/30", violet: "shadow-violet/30", fuchsia: "shadow-fuchsia/30",
  rose: "shadow-rose/30", emerald: "shadow-emerald/30", cyan: "shadow-cyan/30",
  indigo: "shadow-indigo/30", pink: "shadow-pink/30",
};

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
  suffix?: string;
}

export function ProgressBarComponent({ props }: ComponentRenderProps<ProgressBarProps>) {
  const { label, value, max = 100, color = "blue", showValue = true, suffix = "%" } = props;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const bg = COLORS[color] ?? COLORS.blue;
  const glow = GLOWS[color] ?? "";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {showValue && (
          <span className="text-sm font-bold tabular-nums text-foreground">
            {value}{suffix}
          </span>
        )}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${bg} ${glow} shadow-sm transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
