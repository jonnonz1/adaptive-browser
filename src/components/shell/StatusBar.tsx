import { Bug, Settings, Shield, ShieldCheck, Database } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { useSettingsStore } from "../../stores/settings";
import { useDebugStore } from "../../stores/debug";
import { cn } from "../../lib/utils";

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
    <div className="flex items-center justify-between border-t border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {serviceName ? (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-foreground">{serviceName}</span>
          </span>
        ) : (
          <span>No service</span>
        )}
        {cacheStats && cacheStats.entryCount > 0 && (
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {cacheStats.entryCount} cached / {cacheStats.totalHits} hits
          </span>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <BarButton onClick={toggleDebug} active={debugOpen} icon={<Bug className="h-3 w-3" />} label="Debug" />
        <BarButton onClick={openSettings} icon={<Settings className="h-3 w-3" />} label="Settings" />
        <BarButton
          onClick={showAuthDialog}
          icon={isAuthenticated ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
          label={isAuthenticated ? "Authenticated" : "Set Token"}
          variant={isAuthenticated ? "success" : "warning"}
        />
        <span className="ml-2 text-muted-foreground/50">v0.1</span>
      </div>
    </div>
  );
}

function BarButton({
  onClick,
  icon,
  label,
  active,
  variant,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  variant?: "success" | "warning";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 transition-colors hover:bg-accent",
        active && "bg-accent text-primary",
        variant === "success" && "text-success",
        variant === "warning" && "text-warning",
        !active && !variant && "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
