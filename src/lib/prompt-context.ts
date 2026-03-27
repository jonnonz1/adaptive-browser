import type { UiCapability, CapabilityEndpoint, MergedPreferences, EntityPreference } from "./types";

// ─── Few-shot examples of GREAT OpenUI Lang output ───────────────

const EXAMPLE_LIST_TABLE = `
Example: Rendering a list of repositories as a table dashboard

root = Stack([heading, metrics, table], "vertical", 20)
heading = Heading("Repositories", 2)
metrics = MetricGrid(metricItems, 4)
metricItems = [{"label": "Total Repos", "value": "47", "icon": "chart", "color": "violet"}, {"label": "Total Stars", "value": "1,284", "change": "+12%", "changeDirection": "up", "icon": "star", "color": "amber", "sparkline": [800, 900, 1000, 1100, 1200, 1284]}, {"label": "Languages", "value": "8", "icon": "globe", "color": "emerald"}, {"label": "Open Issues", "value": "23", "icon": "activity", "color": "orange"}]
table = DataTable(cols, rows, "stargazers_count", "desc", 25, null)
cols = [{"key": "name", "label": "Name", "sortable": true}, {"key": "description", "label": "Description"}, {"key": "language", "label": "Language"}, {"key": "stargazers_count", "label": "Stars", "sortable": true}, {"key": "updated_at", "label": "Updated", "sortable": true}]
rows = [... actual data rows ...]
`.trim();

const EXAMPLE_LIST_CARDS = `
Example: Rendering a list of repositories as cards

root = Stack([heading, metrics, cards], "vertical", 20)
heading = Heading("Repositories", 2)
metrics = MetricGrid(metricItems, 4)
metricItems = [{"label": "Total Repos", "value": "47", "icon": "chart", "color": "violet"}, {"label": "Total Stars", "value": "1.3K", "icon": "star", "color": "amber"}, {"label": "Forks", "value": "234", "icon": "zap", "color": "cyan"}, {"label": "Languages", "value": "8", "icon": "globe", "color": "emerald"}]
cards = CardGrid(cardItems, 3, null)
cardItems = [{"title": "my-app", "subtitle": "A full-stack web application", "badges": [{"text": "TypeScript", "color": "blue"}, {"text": "Public", "color": "emerald"}], "fields": [{"label": "Stars", "value": "342"}, {"label": "Forks", "value": "28"}, {"label": "Updated", "value": "2h ago"}]}, ...]
`.trim();

const EXAMPLE_DASHBOARD = `
Example: Rendering a comprehensive analytics dashboard

root = Stack([heading, metrics, row2], "vertical", 24)
heading = Heading("Platform Overview", 2)
metrics = MetricGrid(metricItems, 4)
metricItems = [{"label": "Monthly Active Users", "value": "284.9K", "change": "+12.4%", "changeDirection": "up", "icon": "users", "color": "violet", "sparkline": [210, 225, 238, 260, 275, 285]}, {"label": "Revenue", "value": "$1.42M", "change": "+23.5%", "changeDirection": "up", "icon": "dollar", "color": "emerald", "sparkline": [980, 1050, 1120, 1240, 1340, 1420]}, {"label": "P99 Latency", "value": "142ms", "change": "-18ms", "changeDirection": "down", "icon": "zap", "color": "cyan"}, {"label": "NPS", "value": "72", "change": "+4", "changeDirection": "up", "icon": "heart", "color": "rose"}]
row2 = Stack([activity, progress_col], "horizontal", 16)
activity = ActivityFeed("Recent Activity", feedItems)
feedItems = [{"icon": "zap", "color": "emerald", "title": "v2.41 deployed", "description": "Zero-downtime rolling deploy", "timestamp": "3m ago", "badge": "Deploy", "badgeColor": "emerald"}, {"icon": "bell", "color": "amber", "title": "Latency spike on /api/search", "timestamp": "12m ago", "badge": "Warning", "badgeColor": "amber"}, {"icon": "star", "color": "violet", "title": "Crossed 280K MAU", "timestamp": "1h ago", "badge": "Milestone", "badgeColor": "violet"}]
progress_col = Stack([progress_heading, p1, p2, p3, p4, p5], "vertical", 10)
progress_heading = Heading("Feature Adoption", 3)
p1 = ProgressBar("Dashboard", 94, 100, "violet", true, "%")
p2 = ProgressBar("Reports", 78, 100, "fuchsia", true, "%")
p3 = ProgressBar("API Access", 65, 100, "cyan", true, "%")
p4 = ProgressBar("Alerts", 52, 100, "sky", true, "%")
p5 = ProgressBar("Integrations", 41, 100, "emerald", true, "%")
`.trim();

const EXAMPLE_STATUS = `
Example: Rendering infrastructure status

root = Stack([heading, health, services, deploys_heading, deploys], "vertical", 20)
heading = Heading("Infrastructure", 2)
health = MetricGrid(healthMetrics, 4)
healthMetrics = [{"label": "Requests", "value": "56K/min", "change": "+14%", "changeDirection": "up", "icon": "activity", "color": "violet"}, {"label": "Latency", "value": "67ms", "change": "-12ms", "changeDirection": "down", "icon": "zap", "color": "emerald"}, {"label": "Error Rate", "value": "0.03%", "icon": "chart", "color": "cyan"}, {"label": "Services", "value": "8/8", "icon": "globe", "color": "amber"}]
services = StatusList("Service Health", serviceItems)
serviceItems = [{"label": "API Gateway", "status": "success", "value": "23ms", "description": "99.99% uptime"}, {"label": "Search Engine", "status": "warning", "value": "342ms", "description": "Latency above threshold"}, {"label": "Auth Service", "status": "success", "value": "8ms", "description": "100% uptime"}]
deploys_heading = Heading("Recent Deploys", 3)
deploys = ActivityFeed(null, deployItems)
deployItems = [{"icon": "zap", "color": "emerald", "title": "v2.41 → API Gateway", "description": "Sarah Chen", "timestamp": "3m ago", "badge": "Success", "badgeColor": "emerald"}, {"icon": "bell", "color": "rose", "title": "v3.5 → Search (rollback)", "description": "Jordan Lee", "timestamp": "2h ago", "badge": "Rollback", "badgeColor": "rose"}]
`.trim();

// ─── Color palette reference ─────────────────────────────────────

const COLOR_GUIDE = `
## Color Palette (use these for visual variety)
Available colors for MetricGrid, ProgressBar, StatusList, ActivityFeed, ColorBadge, CardGrid badges:
- violet, fuchsia, rose, pink — warm/creative tones
- orange, amber — warning/attention tones
- emerald, lime, teal — success/growth tones
- cyan, sky, blue, indigo — info/primary tones

MetricGrid icons: activity, users, zap, globe, chart, dollar, eye, heart, star
ActivityFeed icons: user, zap, star, branch, message, bell, heart, eye
StatusList statuses: success, warning, error, pending, active, info

IMPORTANT: Use DIFFERENT colors across MetricGrid cards — never repeat the same color.
Use sparkline arrays (6-12 numbers) on MetricGrid cards to show trends.
`.trim();

// ─── Main prompt builder ─────────────────────────────────────────

export interface DataShape {
  totalItems: number;
  fields: string[];
  sampleRow?: Record<string, unknown>;
  numericFields: string[];
  dateFields: string[];
  enumFields: Array<{ field: string; values: string[] }>;
  nestedFields: string[];
  urlFields: string[];
}

export function extractDataShape(data: unknown): DataShape {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const items = data as Record<string, unknown>[];
    const first = items[0];
    const keys = Object.keys(first);

    const numericFields = keys.filter((k) => typeof first[k] === "number");
    const dateFields = keys.filter((k) => k.endsWith("_at") || k.endsWith("_date") || k === "date");
    const urlFields = keys.filter((k) => k.endsWith("_url") || k === "url" || k === "html_url");
    const nestedFields = keys.filter((k) => first[k] !== null && typeof first[k] === "object");

    // Detect enum-like string fields (few unique values)
    const enumFields: Array<{ field: string; values: string[] }> = [];
    for (const k of keys) {
      if (typeof first[k] === "string" && !urlFields.includes(k) && !dateFields.includes(k)) {
        const unique = [...new Set(items.map((i) => i[k]).filter((v) => typeof v === "string"))].slice(0, 10) as string[];
        if (unique.length > 0 && unique.length <= 8) {
          enumFields.push({ field: k, values: unique });
        }
      }
    }

    return {
      totalItems: items.length,
      fields: keys,
      sampleRow: simplifyRow(first),
      numericFields,
      dateFields,
      enumFields,
      nestedFields,
      urlFields,
    };
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    return {
      totalItems: 1,
      fields: keys,
      sampleRow: simplifyRow(obj),
      numericFields: keys.filter((k) => typeof obj[k] === "number"),
      dateFields: keys.filter((k) => k.endsWith("_at") || k.endsWith("_date")),
      enumFields: [],
      nestedFields: keys.filter((k) => obj[k] !== null && typeof obj[k] === "object"),
      urlFields: keys.filter((k) => k.endsWith("_url") || k === "url"),
    };
  }

  return { totalItems: 0, fields: [], numericFields: [], dateFields: [], enumFields: [], nestedFields: [], urlFields: [] };
}

function simplifyRow(row: Record<string, unknown>): Record<string, unknown> {
  const simplified: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key.endsWith("_url") || key === "url" || key === "node_id") continue; // skip noise
    if (value === null || value === undefined) {
      simplified[key] = null;
    } else if (typeof value === "string") {
      simplified[key] = value.length > 60 ? value.slice(0, 60) + "..." : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      simplified[key] = value;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      simplified[key] = obj.login ?? obj.name ?? obj.title ?? `{${Object.keys(obj).length} fields}`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) simplified[key] = "[]";
      else if (typeof value[0] === "object" && (value[0] as Record<string, unknown>).name) {
        simplified[key] = value.slice(0, 3).map((v) => (v as Record<string, unknown>).name).join(", ");
      } else {
        simplified[key] = `[${value.length} items]`;
      }
    }
  }
  return simplified;
}

/**
 * Build the context message for the LLM.
 */
export function buildPromptContext(opts: {
  capability: UiCapability;
  endpoint: CapabilityEndpoint;
  preferences: MergedPreferences;
  dataShape: DataShape;
  serviceName: string;
}): string {
  const { capability, endpoint, preferences, dataShape, serviceName } = opts;
  const entityPrefs = preferences.entities?.[endpoint.entity];
  const viewType = resolveViewType(endpoint, entityPrefs, preferences);
  const density = preferences.display?.density ?? "comfortable";

  const sections: string[] = [];

  // 1. Context
  sections.push(`## What You're Rendering
Service: ${serviceName}
Capability: ${capability.name} — ${capability.description}
Entity: ${endpoint.entity}
Semantic: ${endpoint.semantic}
User role: ${preferences.identity?.role ?? "user"}
Density: ${density}
Requested view: ${viewType}`);

  // 2. Data analysis
  sections.push(`## Data Shape
Total items: ${dataShape.totalItems}
Fields: ${dataShape.fields.filter((f) => !f.endsWith("_url") && f !== "node_id" && f !== "url").join(", ")}
Numeric fields (use for MetricGrid stats): ${dataShape.numericFields.join(", ") || "none"}
Date fields: ${dataShape.dateFields.join(", ") || "none"}
${dataShape.enumFields.length > 0 ? `Categorical fields: ${dataShape.enumFields.map((e) => `${e.field} (${e.values.join(", ")})`).join("; ")}` : ""}
${dataShape.nestedFields.length > 0 ? `Nested objects (flatten these — use .login, .name, or .title): ${dataShape.nestedFields.join(", ")}` : ""}
Sample row (simplified): ${dataShape.sampleRow ? JSON.stringify(dataShape.sampleRow) : "none"}`);

  // 3. Field selection
  if (entityPrefs?.visibleFields) {
    sections.push(`## User's Preferred Fields
Show these fields: ${entityPrefs.visibleFields.join(", ")}
${entityPrefs.sortBy ? `Sort by: ${entityPrefs.sortBy} ${entityPrefs.sortDirection ?? "desc"}` : ""}
${entityPrefs.groupBy ? `Group by: ${entityPrefs.groupBy}` : ""}`);
  }

  // 4. Actions
  if (endpoint.actions?.length) {
    sections.push(`## Available Actions
${endpoint.actions.join(", ")}
${preferences.interaction?.confirmDestructive ? "Destructive actions (delete, close) MUST have confirmMessage." : ""}`);
  }

  return sections.join("\n\n");
}

function resolveViewType(
  endpoint: CapabilityEndpoint,
  entityPrefs: EntityPreference | undefined,
  globalPrefs: MergedPreferences
): string {
  if (entityPrefs?.listView) return entityPrefs.listView;
  if (endpoint.semantic === "list" && globalPrefs.defaults?.listView) return globalPrefs.defaults.listView;
  if (endpoint.semantic === "detail" && globalPrefs.defaults?.detailView) return globalPrefs.defaults.detailView;
  return endpoint.defaultView ?? "table";
}

/**
 * Build the full system prompt. This is the key to great output.
 */
export function buildFullSystemPrompt(libraryPrompt: string): string {
  return `${libraryPrompt}

${COLOR_GUIDE}

## Composition Rules

You MUST follow these rules to produce great UIs:

1. **Always start with Stack as root**, wrapping all top-level elements vertically.
2. **Always include a MetricGrid** at the top of list views. Analyze the numeric fields in the data and produce 3-4 colorful summary metrics. Use DIFFERENT colors for each card. Add sparkline arrays where trend data exists.
3. **For table views**: Use DataTable with well-labeled columns. Skip URL fields, node_id, and other noise. Flatten nested objects (show user.login not the full object).
4. **For card views**: Use CardGrid with 3 columns. Each card needs a title, subtitle, colored badges (for language, status, visibility etc.), and 2-3 key-value fields.
5. **For status/health data**: Use StatusList with appropriate status colors (success/warning/error/active).
6. **For activity/event data**: Use ActivityFeed with varied icon colors and descriptive badges.
7. **Use ProgressBar** for percentage/completion data — each bar a different color.
8. **Use horizontal Stack** to put two components side-by-side (e.g., ActivityFeed + ProgressBar column).
9. **Populate with REAL data** from the provided JSON. Never use placeholder text. Map actual field values into component props.
10. **Flatten nested objects**: If a field contains {"login": "user123"}, render "user123". If it contains {"name": "bug"}, render "bug". Arrays of objects with .name → comma-separated names.

## Density Guidelines
- compact: gap 12, smaller headings (level 3), no descriptions
- comfortable: gap 16-20, normal headings (level 2), brief descriptions
- spacious: gap 24, large headings, full descriptions

## Examples of Great Output

${EXAMPLE_LIST_TABLE}

---

${EXAMPLE_LIST_CARDS}

---

${EXAMPLE_DASHBOARD}

---

${EXAMPLE_STATUS}

## Critical Reminders
- Use the ACTUAL data values from the JSON provided — not made-up numbers
- Every MetricGrid card should have a DIFFERENT color (violet, fuchsia, emerald, cyan, amber, rose, indigo, etc.)
- Flatten nested objects before putting them in rows/cards
- Include sparkline arrays on MetricGrid cards when you can derive trend data
- For list views: MetricGrid (summary) + DataTable/CardGrid (data) is the minimum
- For detail views: use DetailView with logical field groupings
- Output ONLY valid OpenUI Lang — no markdown, no explanation, no code blocks`;
}
