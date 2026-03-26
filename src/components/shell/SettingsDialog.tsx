import { useState, useEffect, type KeyboardEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../../stores/settings";

type Tab = "general" | "preferences" | "org";

export function SettingsDialog() {
  const { isOpen, close } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="flex h-[600px] w-[800px] overflow-hidden rounded-xl"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Sidebar */}
        <div
          className="flex w-48 flex-col p-3"
          style={{ borderRight: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)" }}
        >
          <h2 className="mb-4 px-3 pt-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Settings
          </h2>
          <nav className="space-y-0.5">
            {([
              { id: "general" as Tab, label: "General" },
              { id: "preferences" as Tab, label: "User Preferences" },
              { id: "org" as Tab, label: "Organization" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors"
                style={{
                  backgroundColor: activeTab === tab.id ? "var(--bg-active)" : "transparent",
                  color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex-1" />
          <button
            onClick={close}
            className="w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "preferences" && <YamlEditorTab fileType="user" title="User Preferences" />}
          {activeTab === "org" && <YamlEditorTab fileType="org" title="Organization Preferences" />}
        </div>
      </div>
    </div>
  );
}

function GeneralTab() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    invoke<boolean>("has_llm_config").then(setHasExistingKey).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (apiKey.trim()) {
      try {
        await invoke("set_llm_config", { apiKey: apiKey.trim(), provider });
        setHasExistingKey(true);
        setApiKey("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Failed to save:", err);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          LLM Configuration
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Configure the AI model used for generating adaptive UIs.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            <option value="anthropic">Anthropic (Claude Sonnet)</option>
            <option value="openai">OpenAI (GPT-4o)</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            API Key
            {hasExistingKey && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: "var(--success-muted)", color: "var(--success)" }}
              >
                Configured
              </span>
            )}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasExistingKey ? "Enter new key to update" : "sk-ant-... or sk-..."}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Stored locally. Never sent anywhere except the selected provider's API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "var(--accent)", color: "var(--text-inverse)" }}
          >
            Save
          </button>
          {saved && (
            <span className="text-sm animate-fade-in" style={{ color: "var(--success)" }}>
              Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function YamlEditorTab({ fileType, title }: { fileType: string; title: string }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    invoke<string>("get_raw_preferences", { fileType })
      .then((yaml) => {
        setContent(yaml);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setIsLoading(false);
      });
  }, [fileType]);

  const handleSave = async () => {
    setError(null);
    try {
      await invoke("save_raw_preferences", { fileType, content });
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    setDirty(true);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {fileType === "user"
              ? "Your personal preferences. Controls theme, density, view types, and per-entity overrides."
              : "Organization constraints. Defines allowed values, forced settings, and required fields."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-xs" style={{ color: "var(--warning)" }}>Unsaved</span>
          )}
          {saved && (
            <span className="text-xs animate-fade-in" style={{ color: "var(--success)" }}>Saved!</span>
          )}
          <button
            onClick={handleSave}
            className="rounded-lg px-4 py-1.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: dirty ? "var(--accent)" : "var(--bg-tertiary)",
              color: dirty ? "var(--text-inverse)" : "var(--text-secondary)",
            }}
          >
            Save
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mb-3 rounded-lg px-3 py-2 text-sm animate-fade-in"
          style={{
            backgroundColor: "var(--danger-muted)",
            color: "var(--danger)",
            border: "1px solid var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        className="flex-1 resize-none rounded-lg p-4 font-mono text-sm leading-relaxed outline-none"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          minHeight: 380,
          tabSize: 2,
        }}
        onKeyDown={(e) => {
          // Tab inserts 2 spaces
          if (e.key === "Tab") {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newValue = content.substring(0, start) + "  " + content.substring(end);
            handleChange(newValue);
            // Restore cursor position
            requestAnimationFrame(() => {
              e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
            });
          }
          // Cmd/Ctrl+S to save
          if ((e.metaKey || e.ctrlKey) && e.key === "s") {
            e.preventDefault();
            handleSave();
          }
        }}
      />
    </div>
  );
}
