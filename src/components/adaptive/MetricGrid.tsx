import { TrendingUp, TrendingDown, Minus, Activity, Users, Zap, Globe, BarChart3, DollarSign, Eye, Heart, Star } from "lucide-react";
import type { ComponentRenderProps } from "@openuidev/react-lang";
import { cn } from "../../lib/utils";

const ICONS: Record<string, typeof Activity> = {
  activity: Activity, users: Users, zap: Zap, globe: Globe,
  chart: BarChart3, dollar: DollarSign, eye: Eye, heart: Heart, star: Star,
};

const PALETTES: Record<string, { bg: string; icon: string; glow: string }> = {
  blue:    { bg: "bg-primary/10",     icon: "text-primary",     glow: "shadow-primary/5" },
  violet:  { bg: "bg-violet/10",      icon: "text-violet",      glow: "shadow-violet/5" },
  fuchsia: { bg: "bg-fuchsia/10",     icon: "text-fuchsia",     glow: "shadow-fuchsia/5" },
  rose:    { bg: "bg-rose/10",        icon: "text-rose",        glow: "shadow-rose/5" },
  orange:  { bg: "bg-orange/10",      icon: "text-orange",      glow: "shadow-orange/5" },
  emerald: { bg: "bg-emerald/10",     icon: "text-emerald",     glow: "shadow-emerald/5" },
  cyan:    { bg: "bg-cyan/10",        icon: "text-cyan",        glow: "shadow-cyan/5" },
  indigo:  { bg: "bg-indigo/10",      icon: "text-indigo",      glow: "shadow-indigo/5" },
  pink:    { bg: "bg-pink/10",        icon: "text-pink",        glow: "shadow-pink/5" },
  amber:   { bg: "bg-amber/10",       icon: "text-amber",       glow: "shadow-amber/5" },
  teal:    { bg: "bg-teal/10",        icon: "text-teal",        glow: "shadow-teal/5" },
  sky:     { bg: "bg-sky/10",         icon: "text-sky",         glow: "shadow-sky/5" },
};

interface Metric {
  label: string;
  value: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  icon?: string;
  color?: string;
  sparkline?: number[];
}

interface MetricGridProps {
  metrics: Metric[];
  columns?: number;
}

export function MetricGridComponent({ props }: ComponentRenderProps<MetricGridProps>) {
  const { metrics, columns = 4 } = props;

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(columns, 6)}, minmax(0, 1fr))` }}>
      {metrics?.map((m, i) => {
        const palette = PALETTES[m.color ?? "blue"] ?? PALETTES.blue;
        const Icon = ICONS[m.icon ?? "activity"] ?? Activity;
        const TrendIcon = m.changeDirection === "up" ? TrendingUp : m.changeDirection === "down" ? TrendingDown : Minus;

        return (
          <div
            key={i}
            className={cn("group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-lg transition-all hover:border-border/80", palette.glow)}
          >
            {/* Subtle gradient overlay */}
            <div className={cn("pointer-events-none absolute inset-0 opacity-[0.03]", palette.bg)} style={{ filter: "blur(40px)" }} />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", palette.bg)}>
                  <Icon className={cn("h-4.5 w-4.5", palette.icon)} />
                </div>
                {m.change && (
                  <span className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                    m.changeDirection === "up" ? "bg-success/10 text-success" :
                    m.changeDirection === "down" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  )}>
                    <TrendIcon className="h-3 w-3" />
                    {m.change}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight text-foreground">{m.value}</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{m.label}</p>
              </div>

              {/* Mini sparkline */}
              {m.sparkline && m.sparkline.length > 1 && (
                <div className="mt-3 flex h-8 items-end gap-[2px]">
                  {m.sparkline.map((v, j) => {
                    const max = Math.max(...m.sparkline!);
                    const h = max > 0 ? (v / max) * 100 : 0;
                    return (
                      <div
                        key={j}
                        className={cn("flex-1 rounded-sm transition-all", palette.bg, "opacity-60 group-hover:opacity-100")}
                        style={{ height: `${Math.max(8, h)}%` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
