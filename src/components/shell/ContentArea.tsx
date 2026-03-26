import { useEffect } from "react";
import { Renderer } from "@openuidev/react-lang";
import { useNavigationStore } from "../../stores/navigation";
import { usePreferencesStore } from "../../stores/preferences";
import { useDebugStore } from "../../stores/debug";
import { useAdaptiveUI } from "../../hooks/useAdaptiveUI";
import { AuthDialog } from "./AuthDialog";
import { SettingsDialog } from "./SettingsDialog";

export function ContentArea() {
  const { activeCapability, currentService, apiData, isLoading, error, manifest } =
    useNavigationStore();
  const { preferences, loadPreferences } = usePreferencesStore();
  const { response, isStreaming, error: llmError, generate, library } = useAdaptiveUI();
  const addEvent = useDebugStore((s) => s.addEvent);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    if (apiData && activeCapability && manifest && preferences && currentService) {
      addEvent("render_start", { capabilityId: activeCapability });
      generate({
        domain: currentService.domain,
        capabilityId: activeCapability,
        apiData,
        manifest,
        preferences,
      });
    }
  }, [apiData, activeCapability, manifest, preferences, currentService, generate, addEvent]);

  if (!currentService) {
    return (
      <>
        <AuthDialog />
        <SettingsDialog />
        <WelcomeScreen />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <AuthDialog />
        <SettingsDialog />
        <LoadingState message="Fetching data" detail={`Loading from ${currentService.name}`} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AuthDialog />
        <SettingsDialog />
        <ErrorState message={error} />
      </>
    );
  }

  if (!activeCapability) {
    return (
      <>
        <AuthDialog />
        <SettingsDialog />
        <EmptyState message="Select a capability from the sidebar" />
      </>
    );
  }

  if (isStreaming) {
    return (
      <>
        <AuthDialog />
        <SettingsDialog />
        <LoadingState
          message="Generating adaptive UI"
          detail="Building a bespoke interface from your preferences"
        />
      </>
    );
  }

  return (
    <>
      <AuthDialog />
      <SettingsDialog />

      {llmError && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm animate-fade-in"
          style={{
            backgroundColor: "var(--warning-muted)",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            color: "var(--warning)",
          }}
        >
          <div className="font-medium">LLM generation unavailable</div>
          <div className="mt-0.5 text-xs opacity-80">{llmError}</div>
          <div className="mt-1 text-xs opacity-60">Showing fallback view. Configure your LLM API key in Settings.</div>
        </div>
      )}

      {response ? (
        <div className="animate-fade-in">
          <Renderer response={response} library={library} isStreaming={false} />
        </div>
      ) : apiData ? (
        <FallbackDataView data={apiData} title={activeCapability} />
      ) : null}
    </>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Adaptive Browser
        </h1>
        <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Navigate to any API. Your preferences shape the interface.
          The server provides data — you control the experience.
        </p>
        <div className="space-y-2 text-left">
          <ServiceCard
            domain="api.github.com"
            description="Repositories, issues, pull requests"
            available
          />
          <ServiceCard
            domain="api.stripe.com"
            description="Billing, subscriptions, payments"
          />
          <ServiceCard
            domain="api.linear.app"
            description="Issues, projects, cycles"
          />
        </div>
        <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
          Set your GitHub PAT and LLM API key via the status bar
        </p>
      </div>
    </div>
  );
}

function ServiceCard({
  domain,
  description,
  available,
}: {
  domain: string;
  description: string;
  available?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3 transition-all"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
        opacity: available ? 1 : 0.4,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <code className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            {domain}
          </code>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        </div>
        {available ? (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "var(--success-muted)", color: "var(--success)" }}
          >
            Ready
          </span>
        ) : (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}
          >
            Soon
          </span>
        )}
      </div>
    </div>
  );
}

function LoadingState({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="relative h-8 w-8">
            <div
              className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
            />
          </div>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{message}</p>
        {detail && (
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{detail}</p>
        )}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="max-w-sm rounded-xl p-6 text-center"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--danger)",
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.1)",
        }}
      >
        <div
          className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--danger-muted)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--danger)" }}>Error</p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{message}</p>
    </div>
  );
}

function FallbackDataView({ data, title }: { data: unknown; title: string }) {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const items = data as Record<string, unknown>[];
    const keys = Object.keys(items[0])
      .filter((k) => typeof items[0][k] !== "object" || items[0][k] === null)
      .slice(0, 8);

    return (
      <div className="animate-fade-in">
        <div className="mb-4 flex items-baseline gap-2">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}
          >
            {items.length} items
          </span>
        </div>
        <div
          className="overflow-hidden rounded-xl"
          style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-elevated)" }}>
                  {keys.map((k) => (
                    <th
                      key={k}
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {k.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 25).map((item, i) => (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      backgroundColor: i % 2 === 0 ? "transparent" : "var(--bg-secondary)",
                    }}
                  >
                    {keys.map((k) => (
                      <td key={k} className="px-4 py-2" style={{ color: "var(--text-primary)" }}>
                        {formatValue(item[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4 animate-fade-in"
      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <pre
        className="overflow-auto rounded-lg p-3 text-xs"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-secondary)" }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" && v.length > 60) return v.slice(0, 60) + "...";
  return String(v);
}
