import { useEffect } from "react";
import { Renderer } from "@openuidev/react-lang";
import { useNavigationStore } from "../../stores/navigation";
import { usePreferencesStore } from "../../stores/preferences";
import { useAdaptiveUI } from "../../hooks/useAdaptiveUI";
import { AuthDialog } from "./AuthDialog";
import { SettingsDialog } from "./SettingsDialog";

export function ContentArea() {
  const { activeCapability, currentService, apiData, isLoading, error, manifest } =
    useNavigationStore();
  const { preferences, loadPreferences } = usePreferencesStore();
  const { response, isStreaming, error: llmError, generate, library } = useAdaptiveUI();

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Trigger LLM generation when we have data + preferences
  useEffect(() => {
    if (apiData && activeCapability && manifest && preferences && currentService) {
      generate({
        domain: currentService.domain,
        capabilityId: activeCapability,
        apiData,
        manifest,
        preferences,
      });
    }
  }, [apiData, activeCapability, manifest, preferences, currentService, generate]);

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
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg font-medium" style={{ color: "var(--color-text-primary)" }}>
            Fetching data...
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Loading from {currentService.name}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="max-w-md rounded-lg p-6 text-center"
          style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-danger)" }}
        >
          <p className="text-lg font-medium" style={{ color: "var(--color-danger)" }}>Error</p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!activeCapability) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: "var(--color-text-secondary)" }}>
          Select a capability from the sidebar
        </p>
      </div>
    );
  }

  // LLM is generating
  if (isStreaming) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg font-medium" style={{ color: "var(--color-text-primary)" }}>
            Generating adaptive UI...
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Building a bespoke interface for your preferences
          </p>
        </div>
      </div>
    );
  }

  // LLM error — fall back to raw JSON
  if (llmError) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-warning)" }}
        >
          <p style={{ color: "var(--color-warning)" }}>
            LLM generation failed: {llmError}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Showing raw API data below. Configure your LLM API key in Settings.
          </p>
        </div>
        <FallbackDataView data={apiData} title={activeCapability} />
      </div>
    );
  }

  // Render the adaptive UI
  if (response) {
    return (
      <div>
        <AuthDialog />
        <SettingsDialog />
        <Renderer response={response} library={library} isStreaming={false} />
      </div>
    );
  }

  // No LLM response yet, show fallback
  if (apiData) {
    return <FallbackDataView data={apiData} title={activeCapability} />;
  }

  return null;
}

function FallbackDataView({ data, title }: { data: unknown; title: string }) {
  // Basic table rendering for array data without LLM
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const items = data as Record<string, unknown>[];
    const keys = Object.keys(items[0]).filter(
      (k) => typeof items[0][k] !== "object" || items[0][k] === null
    ).slice(0, 8);

    return (
      <div>
        <h2 className="mb-4 text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          {title}
          <span className="ml-2 text-sm font-normal" style={{ color: "var(--color-text-secondary)" }}>
            ({items.length} items)
          </span>
        </h2>
        <div className="overflow-hidden rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                  {keys.map((k) => (
                    <th key={k} className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-text-secondary)" }}>
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 25).map((item, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                    {keys.map((k) => (
                      <td key={k} className="px-4 py-2" style={{ color: "var(--color-text-primary)" }}>
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
    <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <pre className="overflow-auto text-xs" style={{ color: "var(--color-text-secondary)" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-lg text-center">
        <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Adaptive Browser
        </h1>
        <p className="mb-6 text-lg" style={{ color: "var(--color-text-secondary)" }}>
          Navigate to any API endpoint. Your preferences shape the interface.
        </p>
        <div className="space-y-3 text-left" style={{ color: "var(--color-text-secondary)" }}>
          <div className="rounded-lg p-3" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
            <code className="text-sm" style={{ color: "var(--color-accent)" }}>api.github.com</code>
            <p className="mt-1 text-xs">Browse repositories, issues, and pull requests</p>
          </div>
          <div className="rounded-lg p-3 opacity-50" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
            <code className="text-sm" style={{ color: "var(--color-accent)" }}>api.stripe.com</code>
            <p className="mt-1 text-xs">Manage billing, subscriptions, and payments (coming soon)</p>
          </div>
        </div>
        <p className="mt-6 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Tip: Click "Set API Token" in the status bar to add your GitHub PAT,
          then configure your LLM API key in Settings for adaptive UI generation.
        </p>
      </div>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" && v.length > 60) return v.slice(0, 60) + "...";
  return String(v);
}
