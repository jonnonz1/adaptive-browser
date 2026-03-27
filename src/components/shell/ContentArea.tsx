import { useEffect } from "react";
import { Renderer } from "@openuidev/react-lang";
import { Layers, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { useNavigationStore } from "../../stores/navigation";
import { usePreferencesStore } from "../../stores/preferences";
import { useDebugStore } from "../../stores/debug";
import { useAdaptiveUI } from "../../hooks/useAdaptiveUI";
import { AuthDialog } from "./AuthDialog";
import { SettingsDialog } from "./SettingsDialog";

export function ContentArea() {
  const { activeCapability, currentService, apiData, isLoading, error, manifest } = useNavigationStore();
  const { preferences, loadPreferences } = usePreferencesStore();
  const { response, isStreaming, error: llmError, generate, library } = useAdaptiveUI();
  const addEvent = useDebugStore((s) => s.addEvent);

  useEffect(() => { loadPreferences(); }, [loadPreferences]);

  useEffect(() => {
    if (apiData && activeCapability && manifest && preferences && currentService) {
      addEvent("render_start", { capabilityId: activeCapability });
      generate({ domain: currentService.domain, capabilityId: activeCapability, apiData, manifest, preferences });
    }
  }, [apiData, activeCapability, manifest, preferences, currentService, generate, addEvent]);

  const dialogs = <><AuthDialog /><SettingsDialog /></>;

  if (!currentService) return <>{dialogs}<Welcome /></>;
  if (isLoading) return <>{dialogs}<Spinner label="Fetching data" sub={`from ${currentService.name}`} /></>;
  if (error) return <>{dialogs}<ErrorCard message={error} /></>;
  if (!activeCapability) return <>{dialogs}<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Select a capability from the sidebar</div></>;
  if (isStreaming) return <>{dialogs}<Spinner label="Generating UI" sub="Building interface from your preferences" /></>;

  return (
    <>
      {dialogs}
      {llmError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 animate-in">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-warning">Adaptive UI unavailable</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{llmError}</p>
            <p className="mt-1 text-xs text-muted-foreground">Showing fallback. Configure your LLM key in Settings.</p>
          </div>
        </div>
      )}
      {response ? (
        <div className="animate-in"><Renderer response={response} library={library} isStreaming={false} /></div>
      ) : apiData ? (
        <Fallback data={apiData} title={activeCapability} />
      ) : null}
    </>
  );
}

function Welcome() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
          <Layers className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Adaptive Browser</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Navigate to any API. Your preferences shape the interface.
        </p>

        <div className="mt-8 space-y-2 text-left">
          <SvcCard domain="api.github.com" desc="Repositories, issues, pull requests" ready />
          <SvcCard domain="api.stripe.com" desc="Billing, subscriptions, payments" />
          <SvcCard domain="api.linear.app" desc="Issues, projects, cycles" />
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Set your GitHub PAT and LLM key via the status bar to get started.
        </p>
      </div>
    </div>
  );
}

function SvcCard({ domain, desc, ready }: { domain: string; desc: string; ready?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-colors ${ready ? "hover:border-primary/30" : "opacity-40"}`}>
      <div className="flex items-center gap-3">
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
        <div>
          <code className="text-sm font-medium text-primary">{domain}</code>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ready ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
        {ready ? "Ready" : "Soon"}
      </span>
    </div>
  );
}

function Spinner({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-3 h-6 w-6 text-primary animate-spin" />
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-sm rounded-xl border border-destructive/30 bg-card p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Error</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function Fallback({ data, title }: { data: unknown; title: string }) {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const items = data as Record<string, unknown>[];
    const keys = Object.keys(items[0]).filter((k) => typeof items[0][k] !== "object" || items[0][k] === null).slice(0, 8);

    return (
      <div className="animate-in">
        <div className="mb-4 flex items-baseline gap-2">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length}</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                {keys.map((k) => (
                  <th key={k} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {k.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 25).map((item, i) => (
                <tr key={i} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                  {keys.map((k) => (
                    <td key={k} className="px-4 py-2 text-foreground">{fmtVal(item[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 animate-in">
      <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
      <pre className="overflow-auto rounded-lg bg-background p-3 text-xs text-muted-foreground">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function fmtVal(v: unknown): string {
  if (v == null) return "-";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" && v.length > 50) return v.slice(0, 50) + "...";
  return String(v);
}
