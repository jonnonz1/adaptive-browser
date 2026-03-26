import { useState, type KeyboardEvent } from "react";
import { useAuthStore } from "../../stores/auth";

export function AuthDialog() {
  const { isAuthDialogOpen, hideAuthDialog, setToken, isAuthenticated } = useAuthStore();
  const [tokenInput, setTokenInput] = useState("");

  if (!isAuthDialogOpen) return null;

  const handleSave = () => {
    if (tokenInput.trim()) {
      setToken(tokenInput.trim());
      setTokenInput("");
      hideAuthDialog();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") hideAuthDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          API Authentication
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Enter a Personal Access Token for the current service.
          {isAuthenticated && (
            <span className="ml-1" style={{ color: "var(--success)" }}>(Currently authenticated)</span>
          )}
        </p>
        <input
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          autoFocus
          className="mt-4 w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={hideAuthDialog}
            className="rounded-lg px-4 py-2 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "var(--accent)", color: "var(--text-inverse)" }}
          >
            Save Token
          </button>
        </div>
      </div>
    </div>
  );
}
