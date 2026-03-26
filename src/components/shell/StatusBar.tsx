import { useAuthStore } from "../../stores/auth";
import { useSettingsStore } from "../../stores/settings";
import { useDebugStore } from "../../stores/debug";

interface Props {
  serviceName?: string;
}

export function StatusBar({ serviceName }: Props) {
  const { isAuthenticated, showAuthDialog } = useAuthStore();
  const openSettings = useSettingsStore((s) => s.open);
  const toggleDebug = useDebugStore((s) => s.toggle);
  const debugOpen = useDebugStore((s) => s.isOpen);
  const cacheStats = useDebugStore((s) => s.cacheStats);

  return (
    <div
      className="flex items-center justify-between px-4 py-1.5 text-xs"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        color: "var(--text-muted)",
      }}
    >
      <div className="flex items-center gap-4">
        {serviceName ? (
          <span>
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--success)" }} />
            <span style={{ color: "var(--text-secondary)" }}>{serviceName}</span>
          </span>
        ) : (
          <span>No service</span>
        )}
        {cacheStats && (
          <span>
            Cache: {cacheStats.entryCount} entries, {cacheStats.totalHits} hits
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <StatusButton
          onClick={toggleDebug}
          active={debugOpen}
          label="Debug"
        />
        <StatusButton
          onClick={openSettings}
          label="Settings"
        />
        <StatusButton
          onClick={showAuthDialog}
          label={isAuthenticated ? "Authenticated" : "Set Token"}
          color={isAuthenticated ? "var(--success)" : "var(--warning)"}
        />
        <span className="ml-2" style={{ color: "var(--text-muted)" }}>v0.1.0</span>
      </div>
    </div>
  );
}

function StatusButton({
  onClick,
  label,
  color,
  active,
}: {
  onClick: () => void;
  label: string;
  color?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded px-2 py-0.5 text-xs transition-colors hover:opacity-80"
      style={{
        color: color ?? (active ? "var(--accent)" : "var(--text-secondary)"),
        backgroundColor: active ? "var(--bg-active)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}
