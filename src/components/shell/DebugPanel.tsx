import { X, Trash2 } from "lucide-react";
import { useDebugStore, type DebugEvent, type DebugEventType } from "../../stores/debug";
import { cn } from "../../lib/utils";

const TABS = [
  { id: "events" as const, label: "Events" },
  { id: "prompt" as const, label: "Prompt" },
  { id: "cache" as const, label: "Cache" },
  { id: "performance" as const, label: "Perf" },
] as const;

export function DebugPanel() {
  const { events, activeTab, setTab, close, clearEvents,
    lastSystemPrompt, lastUserMessage, lastLlmResponse, lastTokenUsage, cacheStats } = useDebugStore();

  return (
    <div className="flex h-full w-[400px] flex-col border-l border-border bg-card animate-slide-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Debug</span>
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{events.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={clearEvents} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground" title="Clear"><Trash2 className="h-3.5 w-3.5" /></button>
          <button onClick={close} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground" title="Close"><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={cn(
              "relative flex-1 py-2 text-xs font-medium transition-colors",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "events" && <EventsView events={events} />}
        {activeTab === "prompt" && <PromptView system={lastSystemPrompt} user={lastUserMessage} response={lastLlmResponse} tokens={lastTokenUsage} />}
        {activeTab === "cache" && <CacheView stats={cacheStats} />}
        {activeTab === "performance" && <PerfView events={events} />}
      </div>
    </div>
  );
}

// --- Events ---
function EventsView({ events }: { events: DebugEvent[] }) {
  if (!events.length) return <Empty>Navigate to an API to see events</Empty>;
  return (
    <div>
      {events.map((e) => (
        <div key={e.id} className="border-b border-border px-4 py-2.5 animate-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dot type={e.type} />
              <span className="text-xs font-medium text-foreground">{fmtType(e.type)}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {e.duration != null && <span className="font-mono">{e.duration}ms</span>}
              <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          {Object.keys(e.data).length > 0 && (
            <pre className="mt-1.5 max-h-28 overflow-auto rounded-md bg-muted p-2 text-[10px] leading-relaxed text-muted-foreground">
              {JSON.stringify(e.data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Prompt ---
function PromptView({ system, user, response, tokens }: {
  system: string | null; user: string | null; response: string | null;
  tokens: { input: number; output: number } | null;
}) {
  if (!system && !user) return <Empty>No LLM calls yet</Empty>;
  return (
    <div className="space-y-4 p-4">
      {tokens && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Input" value={`${tokens.input.toLocaleString()}`} sub="tokens" />
          <Stat label="Output" value={`${tokens.output.toLocaleString()}`} sub="tokens" />
          <Stat label="Cost" value={`$${((tokens.input * 0.003 + tokens.output * 0.015) / 1000).toFixed(4)}`} sub="est." />
        </div>
      )}
      <PromptBlock title="System Prompt" text={system} />
      <PromptBlock title="User Message" text={user} />
      <PromptBlock title="LLM Response" text={response} />
    </div>
  );
}

// --- Cache ---
function CacheView({ stats }: { stats: { entryCount: number; totalHits: number; maxEntries: number } | null }) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Entries" value={stats?.entryCount ?? 0} />
        <Stat label="Hits" value={stats?.totalHits ?? 0} />
        <Stat label="Capacity" value={stats?.maxEntries ?? 100} />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Generated UIs are cached for 30 min keyed by endpoint + data shape + preference hash.
      </p>
    </div>
  );
}

// --- Performance ---
function PerfView({ events }: { events: DebugEvent[] }) {
  const avg = (type: string) => {
    const e = events.filter((x) => x.type === type && x.duration != null);
    return e.length ? Math.round(e.reduce((s, x) => s + (x.duration ?? 0), 0) / e.length) : 0;
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="LLM" value={`${avg("llm_response")}ms`} />
        <Stat label="API" value={`${avg("api_fetch")}ms`} />
        <Stat label="Render" value={`${avg("render_complete")}ms`} />
      </div>
      <div className="mt-4 space-y-1">
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Recent</h4>
        {events.filter((e) => e.duration != null).slice(0, 15).map((e) => (
          <div key={e.id} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{fmtType(e.type)}</span>
            <span className="font-mono text-foreground">{e.duration}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Shared ---
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">{children}</div>;
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg bg-muted p-2.5 text-center">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-bold text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function PromptBlock({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold text-muted-foreground">{title}</h4>
      <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">{text}</pre>
    </div>
  );
}

function Dot({ type }: { type: DebugEventType }) {
  const c: Record<string, string> = {
    cache_hit: "bg-success", cache_miss: "bg-warning", llm_request: "bg-primary",
    llm_response: "bg-primary", llm_error: "bg-destructive", render_complete: "bg-success",
  };
  return <div className={cn("h-2 w-2 rounded-full", c[type] ?? "bg-muted-foreground")} />;
}

function fmtType(t: string) { return t.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "); }
