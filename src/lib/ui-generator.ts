/**
 * Deterministic UI generators — build rich OpenUI Lang from API data + manifest + preferences.
 * No LLM needed. Produces the same quality as the demo dashboards.
 */

import type { UiCapability, CapabilityEndpoint, MergedPreferences, EntityPreference } from "./types";

interface GeneratorContext {
  capability: UiCapability;
  endpoint: CapabilityEndpoint;
  preferences: MergedPreferences;
  data: unknown;
  serviceName: string;
}

/**
 * Generate OpenUI Lang for any data. Returns null if no generator matches
 * (falls through to LLM).
 */
export function generateUI(ctx: GeneratorContext): string | null {
  const { endpoint, data } = ctx;

  if (!data) return null;

  // Array data → list views
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const items = data as Record<string, unknown>[];
    const entityPrefs = ctx.preferences.entities?.[endpoint.entity];
    const viewType = resolveView(endpoint, entityPrefs, ctx.preferences);

    switch (viewType) {
      case "cards":
        return generateCardView(ctx, items);
      case "kanban":
      case "table":
      default:
        return generateTableView(ctx, items);
    }
  }

  // Single object → detail view
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return generateDetailView(ctx, data as Record<string, unknown>);
  }

  return null;
}

function resolveView(
  endpoint: CapabilityEndpoint,
  entityPrefs: EntityPreference | undefined,
  prefs: MergedPreferences
): string {
  if (entityPrefs?.listView) return entityPrefs.listView;
  if (endpoint.semantic === "list" && prefs.defaults?.listView) return prefs.defaults.listView;
  return endpoint.defaultView ?? "table";
}

// ─── Table View ──────────────────────────────────────────────────

function generateTableView(ctx: GeneratorContext, items: Record<string, unknown>[]): string {
  const { capability, endpoint, preferences } = ctx;
  const entityPrefs = preferences.entities?.[endpoint.entity];

  // Pick fields
  const allKeys = Object.keys(items[0]);
  const visibleFields = entityPrefs?.visibleFields ??
    pickDefaultFields(allKeys, endpoint.entity);

  // Build metrics
  const metrics = buildMetrics(items, endpoint.entity, capability.name);

  // Build columns
  const columns = visibleFields.map((k) => ({
    key: k,
    label: humanize(k),
    sortable: endpoint.sortableFields?.includes(k) ?? false,
  }));

  // Build rows (flatten nested objects)
  const rows = items.slice(0, 50).map((item) => {
    const row: Record<string, unknown> = {};
    for (const k of visibleFields) {
      row[k] = flattenValue(item[k]);
    }
    return row;
  });

  const sortBy = entityPrefs?.sortBy ?? endpoint.sortableFields?.[0];
  const sortDir = entityPrefs?.sortDirection ?? "desc";

  const lines: string[] = [];
  lines.push(`root = Stack([heading, metrics_row, table], "vertical", 20)`);
  lines.push(`heading = Heading("${capability.name}", 2)`);

  // Metrics row
  lines.push(`metrics_row = MetricGrid(metricItems, ${Math.min(metrics.length, 4)})`);
  lines.push(`metricItems = ${JSON.stringify(metrics)}`);

  // Table
  lines.push(`table = DataTable(columns, rows, ${sortBy ? `"${sortBy}"` : "null"}, ${sortBy ? `"${sortDir}"` : "null"}, 25, null)`);
  lines.push(`columns = ${JSON.stringify(columns)}`);
  lines.push(`rows = ${JSON.stringify(rows)}`);

  return lines.join("\n");
}

// ─── Card View ───────────────────────────────────────────────────

function generateCardView(ctx: GeneratorContext, items: Record<string, unknown>[]): string {
  const { capability, endpoint, preferences } = ctx;
  const entityPrefs = preferences.entities?.[endpoint.entity];
  const visibleFields = entityPrefs?.visibleFields ??
    pickDefaultFields(Object.keys(items[0]), endpoint.entity);

  const metrics = buildMetrics(items, endpoint.entity, capability.name);

  // Build cards
  const cards = items.slice(0, 24).map((item) => {
    const titleField = findField(item, ["name", "title", "full_name", "login", "description"]);
    const subtitleField = findField(item, ["description", "body", "bio", "html_url"]);

    const badges: { text: string; color?: string }[] = [];
    if (item.language && typeof item.language === "string") {
      badges.push({ text: item.language, color: langColor(item.language as string) });
    }
    if (item.private === true) badges.push({ text: "Private", color: "amber" });
    if (item.private === false) badges.push({ text: "Public", color: "emerald" });
    if (item.state && typeof item.state === "string") {
      badges.push({ text: item.state, color: item.state === "open" ? "emerald" : "rose" });
    }
    if (item.archived === true) badges.push({ text: "Archived", color: "gray" });
    if (item.fork === true) badges.push({ text: "Fork", color: "cyan" });

    const fields: { label: string; value: string }[] = [];
    for (const k of visibleFields.slice(0, 4)) {
      if (k === titleField.key || k === subtitleField.key) continue;
      const v = item[k];
      if (v !== null && v !== undefined && typeof v !== "object") {
        fields.push({ label: humanize(k), value: String(v) });
      }
    }

    return {
      title: String(titleField.value ?? "Untitled"),
      subtitle: subtitleField.value ? String(subtitleField.value).slice(0, 100) : undefined,
      badges: badges.length > 0 ? badges : undefined,
      fields: fields.length > 0 ? fields : undefined,
    };
  });

  const lines: string[] = [];
  lines.push(`root = Stack([heading, metrics_row, cards], "vertical", 20)`);
  lines.push(`heading = Heading("${capability.name}", 2)`);
  lines.push(`metrics_row = MetricGrid(metricItems, ${Math.min(metrics.length, 4)})`);
  lines.push(`metricItems = ${JSON.stringify(metrics)}`);
  lines.push(`cards = CardGrid(cardItems, 3, null)`);
  lines.push(`cardItems = ${JSON.stringify(cards)}`);

  return lines.join("\n");
}

// ─── Detail View ─────────────────────────────────────────────────

function generateDetailView(ctx: GeneratorContext, item: Record<string, unknown>): string {
  const { capability } = ctx;
  const titleField = findField(item, ["name", "title", "full_name", "login"]);
  const subtitleField = findField(item, ["description", "body", "bio", "html_url"]);

  // Group fields into sections
  const allKeys = Object.keys(item);
  const scalarKeys = allKeys.filter((k) => {
    const v = item[k];
    return v !== null && v !== undefined && typeof v !== "object";
  });

  const primaryFields = scalarKeys.slice(0, 8);
  const secondaryFields = scalarKeys.slice(8, 16);

  const sections = [
    {
      title: "Details",
      fields: primaryFields.map((k) => ({
        key: k,
        label: humanize(k),
        value: flattenValue(item[k]),
        type: k.includes("_at") || k.includes("date") ? "date" : "text",
      })),
    },
  ];

  if (secondaryFields.length > 0) {
    sections.push({
      title: "Additional Info",
      fields: secondaryFields.map((k) => ({
        key: k,
        label: humanize(k),
        value: flattenValue(item[k]),
        type: "text",
      })),
    });
  }

  const actions = ctx.endpoint.actions?.map((a) => ({
    label: humanize(a),
    variant: a === "delete" ? "danger" : a === "star" || a === "fork" ? "secondary" : "primary",
  })) ?? [];

  const lines: string[] = [];
  lines.push(`root = Stack([detail], "vertical", 20)`);
  lines.push(`detail = DetailView("${esc(String(titleField.value ?? capability.name))}", ${subtitleField.value ? `"${esc(String(subtitleField.value).slice(0, 120))}"` : "null"}, sections, ${actions.length > 0 ? "actions" : "null"})`);
  lines.push(`sections = ${JSON.stringify(sections)}`);
  if (actions.length > 0) lines.push(`actions = ${JSON.stringify(actions)}`);

  return lines.join("\n");
}

// ─── Metrics Builder ─────────────────────────────────────────────

function buildMetrics(items: Record<string, unknown>[], entity: string, capName: string): Array<{
  label: string; value: string; icon: string; color: string;
  change?: string; changeDirection?: string;
}> {
  const metrics: Array<{ label: string; value: string; icon: string; color: string; change?: string; changeDirection?: string }> = [];

  // Total count
  metrics.push({
    label: `Total ${capName}`,
    value: items.length.toLocaleString(),
    icon: "chart",
    color: "violet",
  });

  // Entity-specific metrics
  if (entity === "repository") {
    const totalStars = sum(items, "stargazers_count");
    const totalForks = sum(items, "forks_count");
    const totalIssues = sum(items, "open_issues_count");
    const languages = countUnique(items, "language");

    if (totalStars > 0) metrics.push({ label: "Total Stars", value: fmt(totalStars), icon: "star", color: "amber" });
    if (totalForks > 0) metrics.push({ label: "Total Forks", value: fmt(totalForks), icon: "zap", color: "cyan" });
    if (totalIssues > 0) metrics.push({ label: "Open Issues", value: fmt(totalIssues), icon: "activity", color: "orange" });
    if (languages > 0) metrics.push({ label: "Languages", value: String(languages), icon: "globe", color: "emerald" });
  } else if (entity === "issue") {
    const open = items.filter((i) => i.state === "open").length;
    const closed = items.filter((i) => i.state === "closed").length;
    const withComments = items.filter((i) => (i.comments as number) > 0).length;

    metrics.push({ label: "Open", value: String(open), icon: "activity", color: "emerald" });
    metrics.push({ label: "Closed", value: String(closed), icon: "eye", color: "rose" });
    if (withComments > 0) metrics.push({ label: "With Comments", value: String(withComments), icon: "heart", color: "fuchsia" });
  } else if (entity === "gist") {
    const totalFiles = items.reduce((s, i) => s + (i.files ? Object.keys(i.files as Record<string, unknown>).length : 0), 0);
    const pub = items.filter((i) => i.public === true).length;
    metrics.push({ label: "Total Files", value: String(totalFiles), icon: "eye", color: "cyan" });
    metrics.push({ label: "Public", value: String(pub), icon: "globe", color: "emerald" });
  } else {
    // Generic — try common numeric fields
    for (const [field, icon, color] of [
      ["stargazers_count", "star", "amber"],
      ["watchers_count", "eye", "cyan"],
      ["score", "chart", "fuchsia"],
      ["size", "zap", "indigo"],
    ] as const) {
      const total = sum(items, field);
      if (total > 0) {
        metrics.push({ label: humanize(field), value: fmt(total), icon, color });
        if (metrics.length >= 4) break;
      }
    }
  }

  return metrics.slice(0, 4);
}

// ─── Helpers ─────────────────────────────────────────────────────

function pickDefaultFields(allKeys: string[], entity: string): string[] {
  const ENTITY_DEFAULTS: Record<string, string[]> = {
    repository: ["name", "description", "language", "stargazers_count", "forks_count", "updated_at"],
    issue: ["title", "state", "user", "labels", "comments", "created_at"],
    pull_request: ["title", "state", "user", "created_at", "updated_at"],
    gist: ["description", "public", "created_at", "updated_at"],
  };
  const defaults = ENTITY_DEFAULTS[entity];
  if (defaults) return defaults.filter((k) => allKeys.includes(k));

  // Generic: pick short scalar fields
  return allKeys
    .filter((k) => !k.endsWith("_url") && !k.endsWith("_id") && k !== "node_id" && k !== "id" && k !== "url")
    .slice(0, 6);
}

function findField(item: Record<string, unknown>, candidates: string[]): { key: string; value: unknown } {
  for (const c of candidates) {
    if (item[c] !== null && item[c] !== undefined && item[c] !== "") {
      return { key: c, value: item[c] };
    }
  }
  const first = Object.keys(item)[0];
  return { key: first, value: item[first] };
}

function flattenValue(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && !Array.isArray(v)) {
    const obj = v as Record<string, unknown>;
    // Common GitHub pattern: { login: "user" }
    if (obj.login) return obj.login;
    if (obj.name) return obj.name;
    if (obj.title) return obj.title;
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    // Labels array
    if (typeof v[0] === "object" && (v[0] as Record<string, unknown>).name) {
      return v.map((x) => (x as Record<string, unknown>).name).join(", ");
    }
    return `${v.length} items`;
  }
  return v;
}

function humanize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function sum(items: Record<string, unknown>[], key: string): number {
  return items.reduce((s, i) => s + (typeof i[key] === "number" ? (i[key] as number) : 0), 0);
}

function countUnique(items: Record<string, unknown>[], key: string): number {
  const set = new Set(items.map((i) => i[key]).filter(Boolean));
  return set.size;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function esc(s: string): string {
  return s.replace(/"/g, '\\"').replace(/\n/g, " ");
}

function langColor(lang: string): string {
  const map: Record<string, string> = {
    TypeScript: "blue", JavaScript: "amber", Python: "emerald", Rust: "orange",
    Go: "cyan", Java: "rose", Ruby: "red", "C++": "violet", C: "indigo",
    Swift: "orange", Kotlin: "violet", PHP: "indigo", Shell: "lime",
    HTML: "orange", CSS: "sky", Dart: "teal", Scala: "rose",
  };
  return map[lang] ?? "gray";
}
