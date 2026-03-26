import { useNavigationStore } from "../../stores/navigation";
import { AuthDialog } from "./AuthDialog";

export function ContentArea() {
  const { activeCapability, currentService, apiData, isLoading, error } = useNavigationStore();

  if (!currentService) {
    return <WelcomeScreen />;
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl animate-spin">*</div>
          <p style={{ color: "var(--color-text-secondary)" }}>Generating adaptive UI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-danger)" }}>
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
          Select a capability from the sidebar to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <AuthDialog />
      {apiData ? (
        <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
          <h2 className="mb-4 text-lg font-semibold">{activeCapability}</h2>
          <pre className="overflow-auto text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      ) : (
        <p style={{ color: "var(--color-text-secondary)" }}>No data loaded</p>
      )}
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
          <div className="rounded-lg p-3 opacity-50" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
            <code className="text-sm" style={{ color: "var(--color-accent)" }}>api.linear.app</code>
            <p className="mt-1 text-xs">Track issues, projects, and cycles (coming soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
