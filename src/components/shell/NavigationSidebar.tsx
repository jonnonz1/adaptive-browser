import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigationStore } from "../../stores/navigation";
import { cn } from "../../lib/utils";
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
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-12" : "w-56"
      )}
    >
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-b border-sidebar-border text-muted-foreground transition-colors hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {!collapsed && (
        <nav className="flex-1 overflow-y-auto p-2">
          {capabilities.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              Navigate to an API to begin
            </p>
          ) : (
            <>
              <CapGroup caps={primaryCaps} activeId={activeCapability} onSelect={setActiveCapability} />
              {secondaryCaps.length > 0 && (
                <>
                  <div className="mx-3 my-2 border-t border-sidebar-border" />
                  <CapGroup caps={secondaryCaps} activeId={activeCapability} onSelect={setActiveCapability} />
                </>
              )}
            </>
          )}
        </nav>
      )}
    </aside>
  );
}

function CapGroup({
  caps,
  activeId,
  onSelect,
}: {
  caps: UiCapability[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {caps.map((cap) => {
        const active = activeId === cap.id;
        return (
          <button
            key={cap.id}
            onClick={() => onSelect(cap.id)}
            className={cn(
              "group flex w-full items-start gap-2 rounded-md px-3 py-2 text-left transition-colors",
              active
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{cap.name}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{cap.description}</div>
            </div>
            {active && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
