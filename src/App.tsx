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
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      <AddressBar />
      <div className="flex flex-1 overflow-hidden">
        <NavigationSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="relative flex-1 overflow-auto">
          <div className="h-full p-5">
            <ContentArea />
          </div>
        </main>
        {debugOpen && <DebugPanel />}
      </div>
      <StatusBar serviceName={currentService?.name} />
    </div>
  );
}
