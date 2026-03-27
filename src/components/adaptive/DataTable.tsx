import { ArrowUpDown } from "lucide-react";
import type { ComponentRenderProps } from "@openuidev/react-lang";

interface DataTableProps {
  columns: Array<{ key: string; label: string; sortable?: boolean }>;
  rows: Array<Record<string, unknown>>;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageSize?: number;
  title?: string;
}

export function DataTableComponent({ props }: ComponentRenderProps<DataTableProps>) {
  const { columns, rows, sortBy, sortDirection, pageSize = 25, title } = props;
  const display = rows?.slice(0, pageSize) ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      {title && (
        <div className="border-b border-border bg-muted px-4 py-2.5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns?.map((col) => (
                <th key={col.key} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && <ArrowUpDown className="h-3 w-3" />}
                    {sortBy === col.key && (
                      <span className="text-primary">{sortDirection === "asc" ? "^" : "v"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                {columns?.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-foreground">{fmt(row[col.key])}</td>
                ))}
              </tr>
            ))}
            {!display.length && (
              <tr><td colSpan={columns?.length ?? 1} className="px-4 py-8 text-center text-muted-foreground">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {rows && rows.length > pageSize && (
        <div className="border-t border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          Showing {display.length} of {rows.length}
        </div>
      )}
    </div>
  );
}

function fmt(v: unknown): string {
  if (v == null) return "-";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return v.toLocaleString();
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
