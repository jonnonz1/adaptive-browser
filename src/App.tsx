import { useState } from "react";
import { AddressBar } from "./components/shell/AddressBar";
import { NavigationSidebar } from "./components/shell/NavigationSidebar";
import { StatusBar } from "./components/shell/StatusBar";
import { ContentArea } from "./components/shell/ContentArea";
import { useNavigationStore } from "./stores/navigation";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentService = useNavigationStore((s) => s.currentService);

  return (
    <div className="flex h-full flex-col">
      <AddressBar />
      <div className="flex flex-1 overflow-hidden">
        <NavigationSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto p-4">
          <ContentArea />
        </main>
      </div>
      <StatusBar serviceName={currentService?.name} />
    </div>
  );
}
