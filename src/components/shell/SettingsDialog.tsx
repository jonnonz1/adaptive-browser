import { useState, useEffect, type KeyboardEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Check, AlertCircle, Bot, FileText, Building2 } from "lucide-react";
import { useSettingsStore } from "../../stores/settings";
import { cn } from "../../lib/utils";

type Tab = "general" | "preferences" | "org";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "LLM Provider", icon: <Bot className="h-4 w-4" /> },
  { id: "preferences", label: "User Prefs", icon: <FileText className="h-4 w-4" /> },
  { id: "org", label: "Organization", icon: <Building2 className="h-4 w-4" /> },
];

export function SettingsDialog() {
  const { isOpen, close } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in">
      <div className="flex h-[560px] w-[760px] overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-in">
        {/* Sidebar */}
        <div className="flex w-52 flex-col border-r border-border bg-background p-3">
          <div className="mb-4 flex items-center justify-between px-3 pt-1">
            <h2 className="text-sm font-semibold text-foreground">Settings</h2>
            <button onClick={close} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-col gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  activeTab === tab.id
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "preferences" && <YamlTab fileType="user" title="User Preferences" desc="Controls theme, density, view types, per-entity field selection, and workflow shortcuts." />}
          {activeTab === "org" && <YamlTab fileType="org" title="Organization Preferences" desc="Defines constraints (allowed values, forced settings), required fields, and approved services." />}
        </div>
      </div>
    </div>
  );
}

function GeneralTab() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [hasKey, setHasKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    invoke<boolean>("has_llm_config").then(setHasKey).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    try {
      await invoke("set_llm_config", { apiKey: apiKey.trim(), provider });
      setHasKey(true);
      setApiKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">LLM Configuration</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The AI model that generates adaptive UIs from API data and your preferences.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Provider">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="anthropic">Anthropic — Claude Sonnet 4</option>
            <option value="openai">OpenAI — GPT-4o</option>
          </select>
        </Field>

        <Field
          label="API Key"
          badge={hasKey ? <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Active</span> : undefined}
        >
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSave()}
            placeholder={hasKey ? "Enter new key to replace" : "sk-ant-... or sk-..."}
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Stored locally on your machine. Only sent to the selected provider.
          </p>
        </Field>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]"
        >
          {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : "Save"}
        </button>
      </div>
    </div>
  );
}

function YamlTab({ fileType, title, desc }: { fileType: string; title: string; desc: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLoading(true);
    invoke<string>("get_raw_preferences", { fileType })
      .then((yaml) => { setContent(yaml); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, [fileType]);

  const handleSave = async () => {
    setError(null);
    try {
      await invoke("save_raw_preferences", { fileType, content });
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { setError(String(e)); }
  };

  if (loading) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-warning">Unsaved</span>}
          {saved && <span className="flex items-center gap-1 text-xs text-success animate-in"><Check className="h-3 w-3" /> Saved</span>}
          <button
            onClick={handleSave}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors active:scale-[0.98]",
              dirty
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "bg-secondary text-muted-foreground"
            )}
          >
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive animate-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setDirty(true); setError(null); }}
        spellCheck={false}
        className="flex-1 resize-none rounded-lg border border-input bg-background p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        style={{ minHeight: 340, tabSize: 2 }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const s = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const v = content.substring(0, s) + "  " + content.substring(end);
            setContent(v);
            setDirty(true);
            requestAnimationFrame(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; });
          }
          if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
        }}
      />
    </div>
  );
}

function Field({ label, badge, children }: { label: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
        {label}
        {badge}
      </label>
      {children}
    </div>
  );
}
