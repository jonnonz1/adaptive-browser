import { useState, useCallback, type KeyboardEvent } from "react";
import { useNavigationStore } from "../../stores/navigation";

export function AddressBar() {
  const { currentUrl, navigateTo } = useNavigationStore();
  const [input, setInput] = useState(currentUrl || "");
  const [isFocused, setIsFocused] = useState(false);

  const handleNavigate = useCallback(() => {
    const url = input.trim();
    if (url) navigateTo(url);
  }, [input, navigateTo]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleNavigate();
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Protocol badge */}
      <div
        className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide"
        style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--accent)" }}
      >
        API
      </div>

      {/* URL input */}
      <div
        className="relative flex flex-1 items-center rounded-lg transition-all"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          border: isFocused ? "1px solid var(--border-focus)" : "1px solid var(--border-subtle)",
          boxShadow: isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter API endpoint (e.g., api.github.com)"
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Navigate button */}
      <button
        onClick={handleNavigate}
        className="rounded-lg px-5 py-2 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--text-inverse)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        Navigate
      </button>
    </div>
  );
}
