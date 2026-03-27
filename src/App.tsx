import { useState } from "react";
import { AddressBar } from "./components/shell/AddressBar";
import { NavigationSidebar } from "./components/shell/NavigationSidebar";
import { StatusBar } from "./components/shell/StatusBar";
import { ContentArea } from "./components/shell/ContentArea";
import { DebugPanel } from "./components/shell/DebugPanel";
import { useNavigationStore } from "./stores/navigation";
import { useDebugStore } from "./stores/debug";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentService = useNavigationStore((s) => s.currentService);
  const debugOpen = useDebugStore((s) => s.isOpen);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <AddressBar />
      <div className="flex min-h-0 flex-1">
        <NavigationSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <ContentArea />
        </main>
        {debugOpen && <DebugPanel />}
      </div>
      <StatusBar serviceName={currentService?.name} />
    </div>
  );
}
