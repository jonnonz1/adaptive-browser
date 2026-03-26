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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="mb-4 text-lg font-semibold">API Authentication</h2>
        <p className="mb-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Enter a Personal Access Token for the current service.
          {isAuthenticated && (
            <span style={{ color: "var(--color-success)" }}> (Currently authenticated)</span>
          )}
        </p>
        <input
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          autoFocus
          className="mb-4 w-full rounded px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={hideAuthDialog}
            className="rounded px-4 py-2 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg-primary)" }}
          >
            Save Token
          </button>
        </div>
      </div>
    </div>
  );
}
