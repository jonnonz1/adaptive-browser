import type { ComponentRenderProps } from "@openuidev/react-lang";
import { cn } from "../../lib/utils";

interface FieldDef { key: string; label: string; value: unknown; type?: "text" | "link" | "badge" | "date" | "code"; }
interface SectionDef { title: string; fields: FieldDef[]; }
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
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((a, i) => (
              <button key={i} className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                a.variant === "danger" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : a.variant === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-foreground hover:bg-accent"
              )}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {sections?.map((s, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.title}</h3>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            {s.fields?.map((f) => (
              <div key={f.key}>
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 text-sm text-foreground">{fmtField(f)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function fmtField(f: FieldDef): string {
  const v = f.value;
  if (v == null) return "-";
  if (f.type === "date" && typeof v === "string") { try { return new Date(v).toLocaleDateString(); } catch { /* fall through */ } }
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
