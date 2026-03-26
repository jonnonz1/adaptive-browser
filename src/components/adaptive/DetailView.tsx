import type { ComponentRenderProps } from "@openuidev/react-lang";

interface FieldDef {
  key: string;
  label: string;
  value: unknown;
  type?: "text" | "link" | "badge" | "date" | "code";
}

interface SectionDef {
  title: string;
  fields: FieldDef[];
}

interface DetailViewProps {
  title: string;
  subtitle?: string;
  sections: SectionDef[];
  actions?: Array<{ label: string; variant?: "primary" | "secondary" | "danger" }>;
}

export function DetailViewComponent({ props }: ComponentRenderProps<DetailViewProps>) {
  const { title, subtitle, sections, actions } = props;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                className="rounded px-3 py-1.5 text-sm font-medium"
                style={{
                  backgroundColor: action.variant === "danger"
                    ? "var(--color-danger)"
                    : action.variant === "primary"
                    ? "var(--color-accent)"
                    : "var(--color-bg-tertiary)",
                  color: action.variant === "secondary"
                    ? "var(--color-text-primary)"
                    : "var(--color-bg-primary)",
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {sections?.map((section, i) => (
        <div
          key={i}
          className="rounded-lg p-4"
          style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
        >
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
            {section.title}
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {section.fields?.map((field) => (
              <div key={field.key}>
                <dt className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {field.label}
                </dt>
                <dd className="mt-0.5 text-sm" style={{ color: "var(--color-text-primary)" }}>
                  {renderFieldValue(field)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function renderFieldValue(field: FieldDef): string {
  const val = field.value;
  if (val === null || val === undefined) return "-";
  if (field.type === "date" && typeof val === "string") {
    try {
      return new Date(val).toLocaleDateString();
    } catch {
      return String(val);
    }
  }
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}
