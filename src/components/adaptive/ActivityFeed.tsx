import { User, Zap, Star, GitBranch, MessageSquare, Bell, Heart, Eye } from "lucide-react";
import type { ComponentRenderProps } from "@openuidev/react-lang";
import { cn } from "../../lib/utils";

const ICONS: Record<string, typeof User> = {
  user: User, zap: Zap, star: Star, branch: GitBranch,
  message: MessageSquare, bell: Bell, heart: Heart, eye: Eye,
};

const ICON_COLORS: Record<string, { bg: string; fg: string }> = {
  blue:    { bg: "bg-primary/10",   fg: "text-primary" },
  violet:  { bg: "bg-violet/10",    fg: "text-violet" },
  fuchsia: { bg: "bg-fuchsia/10",   fg: "text-fuchsia" },
  rose:    { bg: "bg-rose/10",      fg: "text-rose" },
  emerald: { bg: "bg-emerald/10",   fg: "text-emerald" },
  cyan:    { bg: "bg-cyan/10",      fg: "text-cyan" },
  orange:  { bg: "bg-orange/10",    fg: "text-orange" },
  pink:    { bg: "bg-pink/10",      fg: "text-pink" },
  amber:   { bg: "bg-amber/10",     fg: "text-amber" },
  indigo:  { bg: "bg-indigo/10",    fg: "text-indigo" },
};

interface FeedItem {
  icon?: string;
  color?: string;
  title: string;
  description?: string;
  timestamp?: string;
  badge?: string;
  badgeColor?: string;
}

interface ActivityFeedProps {
  title?: string;
  items: FeedItem[];
}

export function ActivityFeedComponent({ props }: ComponentRenderProps<ActivityFeedProps>) {
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
          const Icon = ICONS[item.icon ?? "zap"] ?? Zap;
          const colors = ICON_COLORS[item.color ?? "blue"] ?? ICON_COLORS.blue;
          const BADGE_MAP: Record<string, string> = {
            blue: "bg-primary/15 text-primary", violet: "bg-violet/15 text-violet",
            fuchsia: "bg-fuchsia/15 text-fuchsia", rose: "bg-rose/15 text-rose",
            emerald: "bg-emerald/15 text-emerald", cyan: "bg-cyan/15 text-cyan",
            orange: "bg-orange/15 text-orange", amber: "bg-amber/15 text-amber",
            pink: "bg-pink/15 text-pink",
          };

          return (
            <div key={i} className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-accent/20">
              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colors.bg)}>
                <Icon className={cn("h-4 w-4", colors.fg)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{item.title}</span>
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.badge && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        BADGE_MAP[item.badgeColor ?? "blue"] ?? BADGE_MAP.blue
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {item.timestamp && (
                      <span className="text-[11px] text-muted-foreground">{item.timestamp}</span>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
