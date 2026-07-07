"use client";

import { useState, useEffect } from "react";

type ExecMode = "local" | "production";

export function ExecutionMode() {
  const [mode, setMode] = useState<ExecMode>("local");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("brd-exec-mode");
    if (stored === "local" || stored === "production") {
      setMode(stored);
    }
  }, []);

  const handleChange = (newMode: ExecMode) => {
    setMode(newMode);
    localStorage.setItem("brd-exec-mode", newMode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        {/* Local mode */}
        <button
          onClick={() => handleChange("local")}
          className={`relative rounded-xl border-2 p-4 text-left transition-all ${
            mode === "local"
              ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900"
              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
          }`}
        >
          {mode === "local" && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-white">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-zinc-900">
                <polyline points="3 8 6 11 13 4" />
              </svg>
            </span>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-300">
                <path d="M4 20h16" /><path d="M4 20V4" /><path d="M4 4h16v16" /><path d="M12 4v16" /><path d="M4 12h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Localhost / MVP</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Development & testing</p>
            </div>
          </div>
          <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Data tidak dikirim ke server eksternal
            </li>
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Proses AI berjalan di browser
            </li>
          </ul>
        </button>

        {/* Production mode */}
        <button
          onClick={() => handleChange("production")}
          className={`relative rounded-xl border-2 p-4 text-left transition-all ${
            mode === "production"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
          }`}
        >
          {mode === "production" && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="3 8 6 11 13 4" />
              </svg>
            </span>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Production</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Server production</p>
            </div>
          </div>
          <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Server-side AI processing
            </li>
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Memerlukan API key & koneksi backend
            </li>
          </ul>
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
            mode === "local"
              ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
          }`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              mode === "local" ? "bg-green-500" : "bg-blue-500"
            }`} />
            {mode === "local" ? "Mode Lokal Aktif" : "Mode Produksi Aktif"}
          </span>
          {saved && (
            <span className="text-[10px] text-green-500 animate-in fade-in">Tersimpan</span>
          )}
        </div>
        <button
          onClick={() => handleChange(mode === "local" ? "production" : "local")}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
            mode === "production" ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"
          }`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
            mode === "production" ? "translate-x-5.5" : "translate-x-0.5"
          }`} />
        </button>
      </div>
    </div>
  );
}
