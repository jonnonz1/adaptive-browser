import type { ComponentRenderProps } from "@openuidev/react-lang";

interface CardDef {
  title: string;
  subtitle?: string;
  badges?: Array<{ text: string; color?: string }>;
  fields?: Array<{ label: string; value: string }>;
  actions?: Array<{ label: string }>;
}
interface CardGridProps { cards: CardDef[]; columns?: number; title?: string; }

export function CardGridComponent({ props }: ComponentRenderProps<CardGridProps>) {
  const { cards, columns = 3, title } = props;
  return (
    <div>
      {title && <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))` }}>
        {cards?.map((c, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20 hover:bg-accent/30">
            <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
            {c.subtitle && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.subtitle}</p>}
            {c.badges && c.badges.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {c.badges.map((b, j) => (
                  <span key={j} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">{b.text}</span>
                ))}
              </div>
            )}
            {c.fields && c.fields.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                {c.fields.map((f, j) => (
                  <div key={j} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-medium text-foreground">{f.value}</span>
                  </div>
                ))}
              </div>
            )}
            {c.actions && c.actions.length > 0 && (
              <div className="mt-3 flex gap-1.5 border-t border-border pt-3">
                {c.actions.map((a, j) => (
                  <button key={j} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent">{a.label}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
