import type { UiCapability, CapabilityEndpoint, MergedPreferences, EntityPreference } from "./types";

/**
 * Build the user context message that tells the LLM what to render.
 * This is appended to the OpenUI library system prompt.
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
  const role = preferences.identity?.role ?? "user";

  const sections: string[] = [];

  // 1. Context
  sections.push(`## Context
You are rendering a ${endpoint.semantic} view of "${capability.name}" from ${serviceName}.
Entity type: ${endpoint.entity}
User role: ${role}
Display density: ${density}`);

  // 2. View type instruction
  sections.push(`## View Type
Render as: ${viewType}
${endpoint.alternateViews ? `Available alternatives: ${endpoint.alternateViews.join(", ")}` : ""}`);

  // 3. Data shape
  sections.push(`## Data
Total items: ${dataShape.totalItems}
Fields available: ${dataShape.fields.join(", ")}
${dataShape.sampleRow ? `Sample row: ${JSON.stringify(dataShape.sampleRow)}` : ""}`);

  // 4. Field selection
  if (entityPrefs?.visibleFields) {
    sections.push(`## Visible Fields (user preference)
Only show these fields: ${entityPrefs.visibleFields.join(", ")}
${entityPrefs.sortBy ? `Default sort: ${entityPrefs.sortBy} ${entityPrefs.sortDirection ?? "desc"}` : ""}
${entityPrefs.groupBy ? `Group by: ${entityPrefs.groupBy}` : ""}`);
  }

  // 5. Actions
  if (endpoint.actions && endpoint.actions.length > 0) {
    sections.push(`## Available Actions
${endpoint.actions.join(", ")}
${preferences.interaction?.confirmDestructive ? "Note: destructive actions (delete, close) MUST include a confirmMessage." : ""}`);
  }

  // 6. Layout instructions based on density
  sections.push(`## Layout Guidelines
${density === "compact" ? "- Use minimal spacing (gap: 8). Favor tables over cards. Small font sizes." :
  density === "spacious" ? "- Use generous spacing (gap: 24). Favor cards over tables. Large text." :
  "- Use moderate spacing (gap: 16). Balance information density with readability."}
- Always wrap the output in a Stack component as the root.
- For list views: include a Heading with the capability name, then the data component.
- For detail views: use DetailView with logical field groupings.
- Use StatCard components for summary metrics when showing lists (count, etc.).`);

  // 7. Org constraints note
  if (preferences._orgName) {
    sections.push(`## Organization: ${preferences._orgName}
${preferences._constraintsApplied?.length ? `Applied constraints: ${preferences._constraintsApplied.join("; ")}` : "No constraints applied."}`);
  }

  return sections.join("\n\n");
}

/**
 * Resolve which view type to use based on endpoint defaults, entity prefs, and global prefs.
 */
function resolveViewType(
  endpoint: CapabilityEndpoint,
  entityPrefs: EntityPreference | undefined,
  globalPrefs: MergedPreferences
): string {
  // Entity-level override wins
  if (entityPrefs?.listView) return entityPrefs.listView;
  // Then global default
  if (endpoint.semantic === "list" && globalPrefs.defaults?.listView) {
    return globalPrefs.defaults.listView;
  }
  if (endpoint.semantic === "detail" && globalPrefs.defaults?.detailView) {
    return globalPrefs.defaults.detailView;
  }
  // Fallback to endpoint default
  return endpoint.defaultView ?? "table";
}

export interface DataShape {
  totalItems: number;
  fields: string[];
  sampleRow?: Record<string, unknown>;
}

/**
 * Extract data shape from API response for the prompt.
 */
export function extractDataShape(data: unknown): DataShape {
  if (Array.isArray(data)) {
    const firstItem = data[0];
    return {
      totalItems: data.length,
      fields: firstItem && typeof firstItem === "object" ? Object.keys(firstItem) : [],
      sampleRow: firstItem && typeof firstItem === "object" ? simplifyRow(firstItem as Record<string, unknown>) : undefined,
    };
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    return {
      totalItems: 1,
      fields: Object.keys(obj),
      sampleRow: simplifyRow(obj),
    };
  }

  return { totalItems: 0, fields: [] };
}

/**
 * Simplify a data row for the prompt — truncate long values, flatten nested objects.
 */
function simplifyRow(row: Record<string, unknown>): Record<string, unknown> {
  const simplified: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      simplified[key] = null;
    } else if (typeof value === "string") {
      simplified[key] = value.length > 80 ? value.slice(0, 80) + "..." : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      simplified[key] = value;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      // Flatten nested objects to just indicate type
      simplified[key] = `{object with ${Object.keys(value as Record<string, unknown>).length} fields}`;
    } else if (Array.isArray(value)) {
      simplified[key] = `[array of ${value.length} items]`;
    }
  }
  return simplified;
}

/**
 * Build the full system prompt by combining the library prompt with our context.
 */
export function buildFullSystemPrompt(libraryPrompt: string): string {
  return `${libraryPrompt}

## Additional Instructions
- Always use the Stack component as the root wrapper.
- Generate real, meaningful UIs from the data provided — not placeholder content.
- Populate table rows and card content from the actual data values provided.
- Match the view type requested by the user's preferences.
- Keep the output concise — only include relevant data fields.
- For list views, include a count as a StatCard if there are more than 5 items.
- Respect the density preference in spacing and component choices.`;
}
