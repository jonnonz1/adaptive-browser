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
  const displayRows = rows?.slice(0, pageSize) ?? [];

  return (
    <div className="overflow-hidden rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
      {title && (
        <div className="px-4 py-3 text-sm font-semibold" style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
              {columns?.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="ml-1">{sortDirection === "asc" ? " ^" : " v"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr
                key={i}
                className="transition-colors hover:opacity-80"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                {columns?.map((col) => (
                  <td key={col.key} className="px-4 py-2" style={{ color: "var(--color-text-primary)" }}>
                    {formatCellValue(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
            {displayRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns?.length ?? 1}
                  className="px-4 py-8 text-center"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows && rows.length > pageSize && (
        <div className="px-4 py-2 text-xs" style={{ color: "var(--color-text-secondary)", backgroundColor: "var(--color-bg-tertiary)" }}>
          Showing {displayRows.length} of {rows.length} rows
        </div>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
