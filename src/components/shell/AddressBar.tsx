import { useState, useCallback, type KeyboardEvent } from "react";
import { useNavigationStore } from "../../stores/navigation";

export function AddressBar() {
  const { currentUrl, navigateTo } = useNavigationStore();
  const [input, setInput] = useState(currentUrl || "");

  const handleNavigate = useCallback(() => {
    const url = input.trim();
    if (url) {
      navigateTo(url);
    }
  }, [input, navigateTo]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleNavigate();
  };

  return (
    <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-secondary)" }}>
      <div className="flex items-center gap-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <span>API</span>
        <span style={{ color: "var(--color-accent)" }}>://</span>
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter API endpoint (e.g., api.github.com)"
        className="flex-1 rounded px-3 py-1.5 text-sm outline-none"
        style={{
          backgroundColor: "var(--color-bg-tertiary)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border)",
        }}
      />
      <button
        onClick={handleNavigate}
        className="rounded px-4 py-1.5 text-sm font-medium transition-colors"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "var(--color-bg-primary)",
        }}
      >
        Navigate
      </button>
    </div>
  );
}
