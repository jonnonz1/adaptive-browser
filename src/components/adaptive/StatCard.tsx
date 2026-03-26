import type { ComponentRenderProps } from "@openuidev/react-lang";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  description?: string;
}

export function StatCardComponent({ props }: ComponentRenderProps<StatCardProps>) {
  const { label, value, change, changeDirection, description } = props;

  const changeColor =
    changeDirection === "up"
      ? "var(--color-success)"
      : changeDirection === "down"
      ? "var(--color-danger)"
      : "var(--color-text-secondary)";

  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
      {change && (
        <p className="mt-1 text-xs" style={{ color: changeColor }}>
          {changeDirection === "up" ? "+" : changeDirection === "down" ? "" : ""}
          {change}
        </p>
      )}
      {description && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
