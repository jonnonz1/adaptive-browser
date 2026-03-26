// UI Manifest types — mirrors the spec
export interface UiManifest {
  version: string;
  service: ServiceInfo;
  openapi?: OpenApiRef;
  auth?: AuthConfig;
  capabilities: UiCapability[];
  navigation?: NavigationConfig;
  branding?: BrandingConfig;
}

export interface ServiceInfo {
  name: string;
  description: string;
  icon?: string;
  domain: string;
  documentation?: string;
}

export interface OpenApiRef {
  url: string;
  version: string;
}

export interface AuthConfig {
  type: "oauth2" | "api_key" | "bearer";
  flows?: Record<string, unknown>;
  fallback?: string;
}

export interface UiCapability {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoints: CapabilityEndpoint[];
}

export interface CapabilityEndpoint {
  operationId: string;
  path: string;
  method: string;
  semantic: "list" | "detail" | "create" | "update" | "delete" | "action";
  entity: string;
  defaultView?: string;
  alternateViews?: string[];
  sortableFields?: string[];
  groupableFields?: string[];
  searchable?: boolean;
  primaryAction?: string;
  actions?: string[];
  relatedCapabilities?: string[];
}

export interface NavigationConfig {
  primary: string[];
  secondary?: string[];
}

export interface BrandingConfig {
  primaryColor?: string;
  accentColor?: string;
  logo?: string;
}

// Preference types
export interface UserPreferences {
  version: string;
  identity?: {
    displayName?: string;
    role?: string;
    timezone?: string;
  };
  display?: {
    theme?: "light" | "dark" | "system";
    density?: "compact" | "comfortable" | "spacious";
    fontSize?: number;
    fontFamily?: string;
  };
  defaults?: {
    listView?: "table" | "cards" | "list" | "kanban";
    detailView?: "full" | "split" | "drawer" | "modal";
    pageSize?: number;
    dateFormat?: "relative" | "iso" | "locale";
  };
  interaction?: {
    confirmDestructive?: boolean;
    keyboardShortcutsEnabled?: boolean;
    inlineEditing?: boolean;
  };
  entities?: Record<string, EntityPreference>;
  services?: Record<string, Partial<UserPreferences>>;
}

export interface EntityPreference {
  listView?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  visibleFields?: string[];
  groupBy?: string;
  pinnedFilters?: Array<{ field: string; value: string }>;
}

export interface OrgPreferences {
  version: string;
  organization: {
    name: string;
    id: string;
  };
  constraints?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  requiredFields?: Record<string, string[]>;
  workflows?: unknown[];
  allowedServices?: Array<{ domain: string; requiredScopes?: string[] }>;
}

export interface MergedPreferences extends UserPreferences {
  _orgName?: string;
  _constraintsApplied?: string[];
}
