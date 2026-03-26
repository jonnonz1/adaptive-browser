import { useNavigationStore } from "../../stores/navigation";
import type { UiCapability } from "../../lib/types";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function NavigationSidebar({ collapsed, onToggle }: Props) {
  const { capabilities, activeCapability, setActiveCapability } = useNavigationStore();

  return (
    <aside
      className="flex flex-col border-r transition-all"
      style={{
        width: collapsed ? 48 : 240,
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      <button
        onClick={onToggle}
        className="p-3 text-left text-xs transition-colors hover:opacity-80"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {collapsed ? ">>>" : "<<<"}
      </button>

      {!collapsed && (
        <nav className="flex-1 overflow-y-auto px-2">
          {capabilities.length === 0 ? (
            <p className="px-2 py-4 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Navigate to an API to see available capabilities
            </p>
          ) : (
            capabilities.map((cap: UiCapability) => (
              <button
                key={cap.id}
                onClick={() => setActiveCapability(cap.id)}
                className="mb-1 w-full rounded px-3 py-2 text-left text-sm transition-colors"
                style={{
                  backgroundColor: activeCapability === cap.id ? "var(--color-bg-tertiary)" : "transparent",
                  color: activeCapability === cap.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                }}
              >
                <div className="font-medium">{cap.name}</div>
                <div className="mt-0.5 text-xs opacity-60">{cap.description}</div>
              </button>
            ))
          )}
        </nav>
      )}
    </aside>
  );
}
