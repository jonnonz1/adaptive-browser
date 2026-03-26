import { useAuthStore } from "../../stores/auth";
import { useSettingsStore } from "../../stores/settings";

interface Props {
  serviceName?: string;
}

export function StatusBar({ serviceName }: Props) {
  const { isAuthenticated, showAuthDialog } = useAuthStore();
  const openSettings = useSettingsStore((s) => s.open);

  return (
    <div
      className="flex items-center justify-between border-t px-3 py-1 text-xs"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
        color: "var(--color-text-secondary)",
      }}
    >
      <div className="flex items-center gap-3">
        {serviceName ? (
          <span>
            Connected to <span style={{ color: "var(--color-accent)" }}>{serviceName}</span>
          </span>
        ) : (
          <span>No service connected</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={openSettings}
          className="transition-colors hover:opacity-80"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Settings
        </button>
        <button
          onClick={showAuthDialog}
          className="transition-colors hover:opacity-80"
          style={{ color: isAuthenticated ? "var(--color-success)" : "var(--color-warning)" }}
        >
          {isAuthenticated ? "Authenticated" : "Set API Token"}
        </button>
        <span>Adaptive Browser v0.1.0</span>
      </div>
    </div>
  );
}
