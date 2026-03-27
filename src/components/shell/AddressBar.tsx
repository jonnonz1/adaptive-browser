import { useState, useCallback, type KeyboardEvent } from "react";
import { Globe, ArrowRight } from "lucide-react";
import { useNavigationStore } from "../../stores/navigation";
import { cn } from "../../lib/utils";

export function AddressBar() {
  const { currentUrl, navigateTo } = useNavigationStore();
  const [input, setInput] = useState(currentUrl || "");
  const [focused, setFocused] = useState(false);

  const handleNavigate = useCallback(() => {
    const url = input.trim();
    if (url) navigateTo(url);
  }, [input, navigateTo]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleNavigate();
  };

  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5">
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold tracking-wide text-primary">API</span>
      </div>

      <div
        className={cn(
          "flex flex-1 items-center rounded-lg border bg-muted transition-all",
          focused ? "border-ring ring-2 ring-ring/20" : "border-input"
        )}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter API endpoint — e.g. api.github.com"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      <button
        onClick={handleNavigate}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.98]"
      >
        Navigate
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
