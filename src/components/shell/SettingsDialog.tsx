import { useState, useEffect, type KeyboardEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../../stores/settings";

export function SettingsDialog() {
  const { isOpen, close } = useSettingsStore();
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      invoke<boolean>("has_llm_config").then(setHasExistingKey).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (apiKey.trim()) {
      try {
        await invoke("set_llm_config", {
          apiKey: apiKey.trim(),
          provider,
        });
        setHasExistingKey(true);
        setApiKey("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Failed to save LLM config:", err);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="mb-4 text-lg font-semibold">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              LLM Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              API Key
              {hasExistingKey && (
                <span className="ml-2" style={{ color: "var(--color-success)" }}>(configured)</span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasExistingKey ? "Enter new key to update" : "sk-ant-... or sk-..."}
              className="w-full rounded px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-bg-tertiary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Your API key is stored locally and never sent anywhere except the LLM provider.
            </p>
          </div>

          {saved && (
            <p className="text-sm" style={{ color: "var(--color-success)" }}>
              Settings saved!
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={close}
            className="rounded px-4 py-2 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="rounded px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg-primary)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
