import { useNavigationStore } from "../../stores/navigation";
import type { UiCapability } from "../../lib/types";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function NavigationSidebar({ collapsed, onToggle }: Props) {
  const { capabilities, activeCapability, setActiveCapability, manifest } =
    useNavigationStore();

  const primary = manifest?.navigation?.primary ?? [];
  const secondary = manifest?.navigation?.secondary ?? [];

  const primaryCaps = capabilities.filter((c) => primary.includes(c.id));
  const secondaryCaps = capabilities.filter((c) => secondary.includes(c.id));

  return (
    <aside
      className="flex flex-col transition-all duration-200"
      style={{
        width: collapsed ? 48 : 220,
        backgroundColor: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center text-xs transition-colors hover:opacity-80"
        style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        {collapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        )}
      </button>

      {!collapsed && (
        <nav className="flex-1 overflow-y-auto p-2">
          {capabilities.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              Navigate to an API to begin
            </p>
          ) : (
            <>
              {primaryCaps.length > 0 && (
                <CapabilityGroup
                  capabilities={primaryCaps}
                  activeId={activeCapability}
                  onSelect={setActiveCapability}
                />
              )}
              {secondaryCaps.length > 0 && (
                <>
                  <div className="mx-3 my-3" style={{ borderTop: "1px solid var(--border-subtle)" }} />
                  <CapabilityGroup
                    capabilities={secondaryCaps}
                    activeId={activeCapability}
                    onSelect={setActiveCapability}
                  />
                </>
              )}
            </>
          )}
        </nav>
      )}
    </aside>
  );
}

function CapabilityGroup({
  capabilities,
  activeId,
  onSelect,
}: {
  capabilities: UiCapability[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {capabilities.map((cap) => {
        const isActive = activeId === cap.id;
        return (
          <button
            key={cap.id}
            onClick={() => onSelect(cap.id)}
            className="group flex w-full items-start rounded-md px-3 py-2 text-left transition-all"
            style={{
              backgroundColor: isActive ? "var(--bg-active)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium leading-tight">{cap.name}</div>
              <div
                className="mt-0.5 truncate text-xs leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                {cap.description}
              </div>
            </div>
            {isActive && (
              <div
                className="mt-1 ml-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
