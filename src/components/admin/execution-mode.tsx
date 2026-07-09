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
    <div className="rounded-[24px] border border-hairline p-5 space-y-4">
      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        {/* Local mode */}
        <button
          onClick={() => handleChange("local")}
          className={`relative rounded-[16px] border-2 p-5 text-left transition-all ${
            mode === "local"
              ? "border-ink bg-canvas "
              : "border-hairline hover:border-ink/20 :border-ink/80"
          }`}
        >
          {mode === "local" && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink ">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="3 8 6 11 13 4" />
              </svg>
            </span>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hairline ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink/80 ">
                <path d="M4 20h16" /><path d="M4 20V4" /><path d="M4 4h16v16" /><path d="M12 4v16" /><path d="M4 12h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink ">Localhost / MVP</h3>
              <p className="text-[11px] text-ink/60 ">Development & testing</p>
            </div>
          </div>
          <ul className="space-y-1 text-xs text-ink/60 ">
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Data tidak dikirim ke server eksternal
            </li>
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Proses AI berjalan di browser
            </li>
          </ul>
        </button>

        {/* Production mode */}
        <button
          onClick={() => handleChange("production")}
          className={`relative rounded-[16px] border-2 p-5 text-left transition-all ${
            mode === "production"
              ? "border-ink bg-canvas "
              : "border-hairline hover:border-ink/20 :border-ink/80"
          }`}
        >
          {mode === "production" && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-canvas0">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="3 8 6 11 13 4" />
              </svg>
            </span>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink ">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink ">Production</h3>
              <p className="text-[11px] text-ink/60 ">Server production</p>
            </div>
          </div>
          <ul className="space-y-1 text-xs text-ink/60 ">
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Server-side AI processing
            </li>
            <li className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><polyline points="4 8 7 11 13 4" /></svg>
              Memerlukan API key & koneksi backend
            </li>
          </ul>
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between pt-2 border-t border-hairline ">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
            mode === "local"
              ? "bg-black/5 text-ink "
              : "bg-black/5 text-ink "
          }`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              mode === "local" ? "bg-green-500" : "bg-canvas0"
            }`} />
            {mode === "local" ? "Mode Lokal Aktif" : "Mode Produksi Aktif"}
          </span>
          {saved && (
            <span className="text-[10px] text-green-600 animate-in fade-in">Tersimpan</span>
          )}
        </div>
        <button
          onClick={() => handleChange(mode === "local" ? "production" : "local")}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
            mode === "production" ? "bg-canvas0" : "bg-black/10 "
          }`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-canvas transform transition-transform ${
            mode === "production" ? "translate-x-5.5" : "translate-x-0.5"
          }`} />
        </button>
      </div>
    </div>
  );
}
