import type { ComponentRenderProps } from "@openuidev/react-lang";

interface CardDef {
  title: string;
  subtitle?: string;
  badges?: Array<{ text: string; color?: string }>;
  fields?: Array<{ label: string; value: string }>;
  actions?: Array<{ label: string }>;
}

interface CardGridProps {
  cards: CardDef[];
  columns?: number;
  title?: string;
}

export function CardGridComponent({ props }: ComponentRenderProps<CardGridProps>) {
  const { cards, columns = 3, title } = props;

  return (
    <div>
      {title && (
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </h2>
      )}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))` }}
      >
        {cards?.map((card, i) => (
          <div
            key={i}
            className="rounded-lg p-4 transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3 className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="mt-1 text-sm line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
                {card.subtitle}
              </p>
            )}
            {card.badges && card.badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {card.badges.map((badge, j) => (
                  <span
                    key={j}
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: badge.color || "var(--color-bg-tertiary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            )}
            {card.fields && card.fields.length > 0 && (
              <div className="mt-3 space-y-1">
                {card.fields.map((field, j) => (
                  <div key={j} className="flex justify-between text-xs">
                    <span style={{ color: "var(--color-text-secondary)" }}>{field.label}</span>
                    <span style={{ color: "var(--color-text-primary)" }}>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
            {card.actions && card.actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {card.actions.map((action, j) => (
                  <button
                    key={j}
                    className="rounded px-2 py-1 text-xs"
                    style={{
                      backgroundColor: "var(--color-bg-tertiary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
