import { useState, type KeyboardEvent } from "react";
import { X, Key } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">API Authentication</h2>
          </div>
          <button onClick={hideAuthDialog} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Enter a Personal Access Token for the current service.
          {isAuthenticated && <span className="ml-1 text-success">(active)</span>}
        </p>

        <input
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          autoFocus
          className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={hideAuthDialog}
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]"
          >
            Save Token
          </button>
        </div>
      </div>
    </div>
  );
}
