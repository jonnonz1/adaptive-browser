import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComponentRenderProps } from "@openuidev/react-lang";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string; value: string; change?: string;
  changeDirection?: "up" | "down" | "neutral"; description?: string;
}

export function StatCardComponent({ props }: ComponentRenderProps<StatCardProps>) {
  const { label, value, change, changeDirection, description } = props;
  const Icon = changeDirection === "up" ? TrendingUp : changeDirection === "down" ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {change && (
        <p className={cn(
          "mt-1 inline-flex items-center gap-1 text-xs font-medium",
          changeDirection === "up" ? "text-success" : changeDirection === "down" ? "text-destructive" : "text-muted-foreground"
        )}>
          <Icon className="h-3 w-3" />
          {change}
        </p>
      )}
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
