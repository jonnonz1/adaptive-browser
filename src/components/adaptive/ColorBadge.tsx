import type { ComponentRenderProps } from "@openuidev/react-lang";
import { cn } from "../../lib/utils";

const BADGE_STYLES: Record<string, string> = {
  blue:    "bg-primary/15 text-primary border-primary/20",
  violet:  "bg-violet/15 text-violet border-violet/20",
  fuchsia: "bg-fuchsia/15 text-fuchsia border-fuchsia/20",
  rose:    "bg-rose/15 text-rose border-rose/20",
  orange:  "bg-orange/15 text-orange border-orange/20",
  amber:   "bg-amber/15 text-amber border-amber/20",
  lime:    "bg-lime/15 text-lime border-lime/20",
  emerald: "bg-emerald/15 text-emerald border-emerald/20",
  teal:    "bg-teal/15 text-teal border-teal/20",
  cyan:    "bg-cyan/15 text-cyan border-cyan/20",
  sky:     "bg-sky/15 text-sky border-sky/20",
  indigo:  "bg-indigo/15 text-indigo border-indigo/20",
  pink:    "bg-pink/15 text-pink border-pink/20",
  green:   "bg-success/15 text-success border-success/20",
  red:     "bg-destructive/15 text-destructive border-destructive/20",
  yellow:  "bg-warning/15 text-warning border-warning/20",
  gray:    "bg-muted text-muted-foreground border-border",
};

interface ColorBadgeProps {
  text: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export function ColorBadgeComponent({ props }: ComponentRenderProps<ColorBadgeProps>) {
  const { text, color = "blue", size = "sm", dot } = props;
  const style = BADGE_STYLES[color] ?? BADGE_STYLES.blue;

  const DOT_COLORS: Record<string, string> = {
    blue: "bg-primary", violet: "bg-violet", fuchsia: "bg-fuchsia", rose: "bg-rose",
    emerald: "bg-emerald", cyan: "bg-cyan", green: "bg-success", red: "bg-destructive",
    yellow: "bg-warning", orange: "bg-orange", pink: "bg-pink", indigo: "bg-indigo",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      style,
      size === "sm" ? "px-2 py-0.5 text-[11px]" :
      size === "lg" ? "px-3.5 py-1.5 text-sm" :
      "px-2.5 py-1 text-xs"
    )}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLORS[color] ?? "bg-primary")} />}
      {text}
    </span>
  );
}
