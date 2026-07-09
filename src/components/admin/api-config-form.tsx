"use client";

import { useState, useEffect } from "react";

interface ApiConfig {
  provider: string;
  apiKey: string;
  model: string;
  enabled: boolean;
}

interface DbApiKey {
  id: string;
  provider: string;
  label: string;
  keyValue: string;
  baseUrl: string;
  active: boolean;
  model?: string;
}

interface TestResult {
  testing: boolean;
  success?: boolean;
  message?: string;
  latency?: number;
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI (GPT-4o)", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"] },
  { value: "anthropic", label: "Anthropic (Claude 3.5)", models: ["claude-3-5-sonnet-latest", "claude-3-opus-latest"] },
  { value: "gemini", label: "Google (Gemini)", models: ["gemini-2.0-flash", "gemini-1.5-pro"] },
];

const PROVIDER_MODELS: Record<string, string[]> = {
  gemini: ["gemini-3.1-pro-preview", "gemini-2.5-pro-exp-03-25", "gemini-2.0-flash", "gemini-1.5-pro"],
  deepseek: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-coder"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-latest", "claude-3-opus-latest", "claude-3-haiku-20240307"],
  custom: [],
};

export function ApiConfigForm() {
  const [config, setConfig] = useState<ApiConfig>({ provider: "openai", apiKey: "", model: "gpt-4o", enabled: true });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<ApiConfig[]>([]);
  const [dbKeys, setDbKeys] = useState<DbApiKey[]>([]);
  const [dbKeysLoading, setDbKeysLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [editKey, setEditKey] = useState<DbApiKey | null>(null);
  const [editForm, setEditForm] = useState({ provider: "", label: "", keyValue: "", baseUrl: "", model: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editTestResult, setEditTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("brd-ai-config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
      } catch { }
    }
    const all = localStorage.getItem("brd-ai-configs");
    if (all) {
      try {
        setSavedConfigs(JSON.parse(all));
      } catch { }
    }
    fetchDbKeys();
  }, []);

  const fetchDbKeys = () => {
    setDbKeysLoading(true);
    fetch("/api/admin/api-keys", { headers: { "x-admin-key": "admin123" } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setDbKeys(Array.isArray(data) ? data : []))
      .catch(() => { })
      .finally(() => setDbKeysLoading(false));
  };

  const toggleDbKey = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/admin/api-keys/${id}`, {
        method: "PATCH",
        headers: { "x-admin-key": "admin123", "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      fetchDbKeys();
    } catch { }
  };

  const deleteDbKey = async (id: string) => {
    try {
      await fetch(`/api/admin/api-keys/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": "admin123" },
      });
      fetchDbKeys();
    } catch { }
  };

  const testConnection = async (id: string) => {
    setTestResults((prev) => ({ ...prev, [id]: { testing: true } }));
    try {
      const res = await fetch("/api/admin/api-keys/test", {
        method: "POST",
        headers: { "x-admin-key": "admin123", "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [id]: { testing: false, success: data.success, message: data.message, latency: data.latency } }));
    } catch {
      setTestResults((prev) => ({ ...prev, [id]: { testing: false, success: false, message: "Failed to test connection" } }));
    }
  };

  const openEdit = async (key: DbApiKey) => {
    // Fetch real unmasked key value from DB
    try {
      const res = await fetch(`/api/admin/api-keys/${key.id}`, { headers: { "x-admin-key": "admin123" } });
      if (res.ok) {
        const full = await res.json();
        setEditForm({ provider: full.provider, label: full.label, keyValue: full.keyValue, baseUrl: full.baseUrl, model: full.model || "" });
        setEditKey(key);
        setEditTestResult(null);
        return;
      }
    } catch { }
    // Fallback to masked value
    setEditForm({ provider: key.provider, label: key.label, keyValue: key.keyValue, baseUrl: key.baseUrl, model: key.model || "" });
    setEditKey(key);
    setEditTestResult(null);
  };

  const saveEdit = async () => {
    if (!editKey) return;
    setSavingEdit(true);
    try {
      await fetch(`/api/admin/api-keys/${editKey.id}`, {
        method: "PATCH",
        headers: { "x-admin-key": "admin123", "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: editForm.provider,
          label: editForm.label,
          keyValue: editForm.keyValue,
          baseUrl: editForm.baseUrl,
          model: editForm.model,
        }),
      });
      setEditKey(null);
      fetchDbKeys();
    } catch { }
    setSavingEdit(false);
  };

  const testEditConnection = async () => {
    setEditTestResult({ testing: true });
    try {
      const res = await fetch("/api/admin/api-keys/test", {
        method: "POST",
        headers: { "x-admin-key": "admin123", "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: editForm.provider,
          keyValue: editForm.keyValue,
          baseUrl: editForm.baseUrl,
        }),
      });
      const data = await res.json();
      setEditTestResult({ testing: false, success: data.success, message: data.message, latency: data.latency });
    } catch {
      setEditTestResult({ testing: false, success: false, message: "Failed to test connection" });
    }
  };

  const currentModels = PROVIDERS.find((p) => p.value === config.provider)?.models ?? [];

  const handleSave = () => {
    localStorage.setItem("brd-ai-config", JSON.stringify(config));
    const existing = savedConfigs.filter((c) => c.provider !== config.provider);
    const updated = [...existing, config];
    setSavedConfigs(updated);
    localStorage.setItem("brd-ai-configs", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUseSaved = (savedConfig: ApiConfig) => {
    setConfig(savedConfig);
  };

  const handleDeleteSaved = (provider: string) => {
    const updated = savedConfigs.filter((c) => c.provider !== provider);
    setSavedConfigs(updated);
    localStorage.setItem("brd-ai-configs", JSON.stringify(updated));
    if (config.provider === provider) {
      setConfig({ provider: "openai", apiKey: "", model: "gpt-4o", enabled: true });
      localStorage.removeItem("brd-ai-config");
    }
  };

  const handleToggleEnabled = (provider: string) => {
    const updated = savedConfigs.map((c) =>
      c.provider === provider ? { ...c, enabled: !c.enabled } : c
    );
    setSavedConfigs(updated);
    localStorage.setItem("brd-ai-configs", JSON.stringify(updated));
    if (config.provider === provider) {
      setConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
      localStorage.setItem("brd-ai-config", JSON.stringify({ ...config, enabled: !config.enabled }));
    }
  };

  return (
    <div className="space-y-5">
      {/* ── DB API Keys (used by AI processor) ── */}
      <div className="rounded-[24px] border border-hairline p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100 ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600 ">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-ink ">API Key Database (Used by AI)</h3>
            <p className="text-[10px] text-ink/60 ">Database keys actively used by the AI processor</p>
          </div>
        </div>

        {dbKeysLoading ? (
          <div className="flex items-center justify-center py-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-ink/40"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
            <span className="text-xs text-ink/40 ml-2">Loading...</span>
          </div>
        ) : dbKeys.length === 0 ? (
          <div className="rounded-[24px] bg-surface-soft border border-dashed border-hairline p-6 text-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-ink/40 mb-2">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <p className="text-xs text-ink/40 ">No API keys in database</p>
            <p className="text-[10px] text-ink/40 mt-0.5">AI will use simulated fallback</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dbKeys.map((key) => (
              <div key={key.id} className={`rounded-[16px] border px-4 py-3 ${key.active
                ? "bg-green-50 border-green-200 "
                : "bg-surface-soft border-hairline opacity-60"
                }`}>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleDbKey(key.id, !key.active)}
                      className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors ${key.active ? "bg-green-500" : "bg-zinc-300 "
                        }`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full bg-canvas transform transition-transform ${key.active ? "translate-x-3.5" : "translate-x-0.5"
                        }`} />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-ink ">{key.label || key.provider}</span>
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-medium bg-black/5 text-ink/60 ">{key.provider}</span>
                        {key.active && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] font-medium text-green-700 ">Active</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-ink/40 font-mono min-w-0 overflow-clip">{key.keyValue}</span>
                        {key.model && <span className="inline-flex items-center rounded-md bg-surface-soft border border-blue-200 px-1.5 py-0.5 text-[9px] font-medium text-blue-700 ">{key.model}</span>}
                        {key.baseUrl && <span className="text-[9px] text-ink/40 truncate max-w-[120px]">{key.baseUrl}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Test button */}
                    <button
                      onClick={() => testConnection(key.id)}
                      disabled={testResults[key.id]?.testing}
                      className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[9px] font-medium text-ink/60 hover:text-ink/80 :text-ink/40 hover:bg-black/5  disabled:opacity-50 transition-colors"
                      title="Test connection"
                    >
                      {testResults[key.id]?.testing ? (
                        <><span className="animate-spin w-2.5 h-2.5 border-2 border-ink/40 border-t-transparent rounded-full" /> Test...</>
                      ) : (
                        <><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2 2" /></svg>
                          Test</>
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(key)}
                      className="p-1 rounded text-ink/40 hover:text-ink/60 hover:bg-black/5  transition-colors"
                      title="Edit key"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3-9 9H2v-3z" /></svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => deleteDbKey(key.id)}
                      className="p-1 rounded text-red-200 hover:text-red-400 hover:bg-red-50 :bg-red-950/30 transition-colors"
                      title="Delete key"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" /></svg>
                    </button>
                  </div>
                </div>
                {/* Test result */}
                {testResults[key.id] && !testResults[key.id]?.testing && (
                  <div className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded text-[10px] ${testResults[key.id]?.success
                    ? "bg-green-100 text-green-700 "
                    : "bg-red-100 text-red-700 "
                    }`}>
                    {testResults[key.id]?.success ? (
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 8 7 11 13 4" /></svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="9" /><line x1="8" y1="11" x2="8" y2="11.01" /></svg>
                    )}
                    <span>{testResults[key.id]?.message}</span>
                    {testResults[key.id]?.latency && (
                      <span className="text-ink/40 ml-auto">{testResults[key.id]?.latency}ms</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── LocalStorage Config (legacy/UI) ── */}
      <div className="rounded-[24px] border border-hairline p-5 space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black/5 ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/60 ">
              <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-ink ">Local Configuration (LocalStorage)</h3>
            <p className="text-[10px] text-ink/40 ">Only applies in local mode, not used by server AI processor</p>
          </div>
        </div>

        {/* Provider & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-ink/80 block mb-1.5">AI Provider</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value, model: PROVIDERS.find((p) => p.value === e.target.value)?.models[0] ?? "" })}
              className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink :ring-white"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink/80 block mb-1.5">Model</label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink :ring-white"
            >
              {currentModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="text-xs font-medium text-ink/80 block mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={config.provider === "openai" ? "sk-..." : config.provider === "anthropic" ? "sk-ant-..." : "AIza..."}
              className="w-full rounded-[12px] border border-hairline bg-canvas pl-3 pr-10 py-2 text-sm text-ink/80 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink :ring-white font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink/40 hover:text-ink/60 :text-ink/40 transition-colors"
            >
              {showKey ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 8s2-4 7-4 7 4 7 4-2 4-7 4-7-4-7-4z" /><line x1="1" y1="1" x2="15" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 8s2-4 7-4 7 4 7 4-2 4-7 4-7-4-7-4z" /><circle cx="8" cy="8" r="2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!config.apiKey}
            className="inline-flex items-center bg-ink rounded-full px-4 py-2 text-xs font-medium text-canvas hover:bg-ink/80 :bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <polyline points="4 8 7 11 13 4" />
                </svg>
                Saved
              </>
            ) : (
              "Save Configuration"
            )}
          </button>
          <span className="text-[10px] text-ink/40">Saved in local storage (local mode).</span>
        </div>

        {/* Saved configs */}
        {savedConfigs.length > 0 && (
          <div className="pt-3 border-t border-hairline ">
            <h4 className="text-[11px] font-medium text-ink/60 mb-2">Saved Configurations</h4>
            <div className="space-y-1.5">
              {savedConfigs.map((sc) => (
                <div key={sc.provider} className={`flex items-center justify-between rounded-[16px] border px-4 py-3 ${sc.enabled
                  ? "bg-surface-soft border-hairline "
                  : "bg-black/5/50 border-hairline opacity-60"
                  }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => handleToggleEnabled(sc.provider)}
                      className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors ${sc.enabled ? "bg-green-500" : "bg-zinc-300 "
                        }`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full bg-canvas transform transition-transform ${sc.enabled ? "translate-x-3.5" : "translate-x-0.5"
                        }`} />
                    </button>
                    <span className={`text-xs font-medium ${sc.enabled ? "text-ink/80 " : "text-ink/40"} shrink-0`}>
                      {PROVIDERS.find((p) => p.value === sc.provider)?.label ?? sc.provider}
                    </span>
                    <span className="text-[10px] text-ink/40 font-mono truncate">
                      {sc.apiKey.substring(0, 12)}...
                    </span>
                    <span className="text-[10px] text-ink/40 hidden sm:inline">({sc.model})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleUseSaved(sc)} className="p-1 rounded text-ink/40 hover:text-ink/60 :text-ink/40 hover:bg-black/10  transition-colors" title="Use">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 8 7 11 13 4" />
                      </svg>
                    </button>
                    <button onClick={() => handleDeleteSaved(sc.provider)} className="p-1 rounded text-red-200 hover:text-red-400 transition-colors" title="Delete">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setEditKey(null); }}>
          <div className="w-full max-w-md rounded-[24px] border border-hairline bg-canvas mx-4 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline ">
              <h2 className="font-semibold text-sm text-ink ">Edit API Key</h2>
              <button onClick={() => setEditKey(null)} className="p-1 rounded-md text-ink/40 hover:text-ink/60 :text-ink/40 hover:bg-black/5  transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-medium text-ink/60 block mb-1">Provider</label>
                <select value={editForm.provider} onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                  className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink"
                >
                  {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  <option value="deepseek">DeepSeek (V4)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink/60 block mb-1">Label</label>
                <input type="text" value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink/60 block mb-1">API Key</label>
                <input type="text" value={editForm.keyValue} onChange={(e) => setEditForm({ ...editForm, keyValue: e.target.value })}
                  className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 font-mono focus:outline-none focus:ring-2 focus:ring-ink" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink/60 block mb-1">Base URL</label>
                <input type="text" value={editForm.baseUrl} onChange={(e) => setEditForm({ ...editForm, baseUrl: e.target.value })}
                  placeholder="https://api.deepseek.com"
                  className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink/60 block mb-1">Model</label>
                {PROVIDER_MODELS[editForm.provider]?.length > 0 ? (
                  <select value={editForm.model} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink font-mono"
                  >
                    <option value="">Select model...</option>
                    {PROVIDER_MODELS[editForm.provider].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="__custom__">Custom...</option>
                  </select>
                ) : (
                  <input type="text" value={editForm.model} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    placeholder="deepseek-chat"
                    className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 font-mono focus:outline-none focus:ring-2 focus:ring-ink" />
                )}
                {/* If "Kustom..." selected, show text input */}
                {editForm.model === "__custom__" && (
                  <input type="text" value="" onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    placeholder="Type custom model name..."
                    autoFocus
                    className="mt-1 w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 font-mono focus:outline-none focus:ring-2 focus:ring-ink" />
                )}
              </div>

              {/* Test button */}
              <div className="pt-1">
                <button
                  onClick={testEditConnection}
                  disabled={editTestResult?.testing || !editForm.keyValue}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink/60 hover:bg-black/5  hover:text-ink :text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {editTestResult?.testing ? (
                    <><span className="animate-spin w-3 h-3 border-2 border-ink/40 border-t-transparent rounded-full" /> Checking...</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2 2" /></svg>
                      Test Connection</>
                  )}
                </button>
              </div>

              {/* Test result */}
              {editTestResult && !editTestResult.testing && (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs ${editTestResult.success
                  ? "bg-green-50 text-green-700 border border-green-200 "
                  : "bg-red-50 text-red-700 border border-red-200 "
                  }`}>
                  {editTestResult.success ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0"><circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="9" /><line x1="8" y1="11" x2="8" y2="11.01" /></svg>
                  )}
                  <span className="flex-1">{editTestResult.message}</span>
                  {editTestResult.latency && <span className="text-ink/40 tabular-nums">{editTestResult.latency}ms</span>}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-hairline ">
              <button onClick={() => setEditKey(null)} className="rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink/60 hover:bg-black/5  transition-colors">Cancel</button>
              <button onClick={saveEdit} disabled={savingEdit || !editForm.keyValue}
                className="inline-flex items-center gap-1.5 bg-ink rounded-full px-4 py-2 text-xs font-medium text-canvas hover:bg-ink/80 :bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {savingEdit ? <><span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Saving...</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
