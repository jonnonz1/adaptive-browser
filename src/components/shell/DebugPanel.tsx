import { useDebugStore, type DebugEvent } from "../../stores/debug";

export function DebugPanel() {
  const { events, activeTab, setTab, close, clearEvents } = useDebugStore();
  const { lastSystemPrompt, lastUserMessage, lastLlmResponse, lastTokenUsage, cacheStats } =
    useDebugStore();

  const tabs = [
    { id: "events" as const, label: "Events" },
    { id: "prompt" as const, label: "Prompt" },
    { id: "cache" as const, label: "Cache" },
    { id: "performance" as const, label: "Perf" },
  ];

  return (
    <div
      className="flex h-full flex-col animate-slide-in-right"
      style={{
        width: 420,
        backgroundColor: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Debug
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "var(--bg-active)", color: "var(--text-muted)" }}
          >
            {events.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearEvents}
            className="rounded px-2 py-1 text-xs transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            Clear
          </button>
          <button
            onClick={close}
            className="rounded px-2 py-1 text-xs transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 px-2"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className="relative px-3 py-2 text-xs font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div
                className="absolute right-3 bottom-0 left-3 h-[2px] rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "events" && <EventsTab events={events} />}
        {activeTab === "prompt" && (
          <PromptTab
            system={lastSystemPrompt}
            user={lastUserMessage}
            response={lastLlmResponse}
            tokens={lastTokenUsage}
          />
        )}
        {activeTab === "cache" && <CacheTab stats={cacheStats} />}
        {activeTab === "performance" && <PerformanceTab events={events} />}
      </div>
    </div>
  );
}

function EventsTab({ events }: { events: DebugEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          No events yet. Navigate to an API to see activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((evt) => (
        <div
          key={evt.id}
          className="border-b px-4 py-2.5 animate-fade-in"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EventBadge type={evt.type} />
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                {formatEventType(evt.type)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {evt.duration !== undefined && (
                <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {evt.duration}ms
                </span>
              )}
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          {Object.keys(evt.data).length > 0 && (
            <pre
              className="mt-1.5 overflow-x-auto rounded px-2 py-1.5 text-[10px] leading-relaxed"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
                maxHeight: 120,
              }}
            >
              {JSON.stringify(evt.data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function PromptTab({
  system,
  user,
  response,
  tokens,
}: {
  system: string | null;
  user: string | null;
  response: string | null;
  tokens: { input: number; output: number } | null;
}) {
  if (!system && !user) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          No LLM calls yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {tokens && (
        <div
          className="flex gap-4 rounded-lg p-3"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Input</div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {tokens.input.toLocaleString()} tokens
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Output</div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {tokens.output.toLocaleString()} tokens
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Est. Cost</div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              ${((tokens.input * 0.003 + tokens.output * 0.015) / 1000).toFixed(4)}
            </div>
          </div>
        </div>
      )}

      <PromptSection title="System Prompt" content={system} />
      <PromptSection title="User Message" content={user} />
      <PromptSection title="LLM Response (OpenUI Lang)" content={response} />
    </div>
  );
}

function PromptSection({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;

  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
        {title}
      </h4>
      <pre
        className="overflow-auto rounded-lg p-3 text-[11px] leading-relaxed"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          color: "var(--text-secondary)",
          maxHeight: 300,
          border: "1px solid var(--border-subtle)",
        }}
      >
        {content}
      </pre>
    </div>
  );
}

function CacheTab({
  stats,
}: {
  stats: { entryCount: number; totalHits: number; maxEntries: number } | null;
}) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Entries" value={stats?.entryCount ?? 0} />
        <StatBox label="Hits" value={stats?.totalHits ?? 0} />
        <StatBox label="Max" value={stats?.maxEntries ?? 100} />
      </div>
      <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        UI responses are cached for 30 minutes, keyed by endpoint + data shape + preference hash.
        Cache prevents redundant LLM calls when navigating between previously viewed capabilities.
      </p>
    </div>
  );
}

function PerformanceTab({ events }: { events: DebugEvent[] }) {
  const llmEvents = events.filter((e) => e.type === "llm_response" && e.duration);
  const apiEvents = events.filter((e) => e.type === "api_fetch" && e.duration);
  const renderEvents = events.filter((e) => e.type === "render_complete" && e.duration);

  const avg = (evts: DebugEvent[]) => {
    if (evts.length === 0) return 0;
    return Math.round(evts.reduce((sum, e) => sum + (e.duration ?? 0), 0) / evts.length);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Avg LLM" value={`${avg(llmEvents)}ms`} />
        <StatBox label="Avg API" value={`${avg(apiEvents)}ms`} />
        <StatBox label="Avg Render" value={`${avg(renderEvents)}ms`} />
      </div>
      <div className="mt-4 space-y-2">
        <h4 className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Recent Timings
        </h4>
        {events
          .filter((e) => e.duration)
          .slice(0, 20)
          .map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{formatEventType(evt.type)}</span>
              <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                {evt.duration}ms
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{ backgroundColor: "var(--bg-tertiary)" }}
    >
      <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="mt-0.5 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    cache_hit: "var(--success)",
    cache_miss: "var(--warning)",
    llm_request: "var(--accent)",
    llm_response: "var(--accent)",
    llm_error: "var(--danger)",
    api_fetch: "var(--text-secondary)",
    render_complete: "var(--success)",
    manifest_resolve: "var(--text-muted)",
  };

  return (
    <div
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: colors[type] ?? "var(--text-muted)" }}
    />
  );
}

function formatEventType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
