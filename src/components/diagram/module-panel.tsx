"use client";

import { useState } from "react";

interface ModuleData {
  name: string;
  screens: string[];
}

interface ModulePanelProps {
  modules: ModuleData[];
  activeModule?: string | null;
  activeScreen?: string | null;
  onScreenSelect?: (screenName: string) => void;
  onModuleSelect?: (moduleName: string) => void;
}

export function ModulePanel({ modules, activeModule, activeScreen, onScreenSelect, onModuleSelect }: ModulePanelProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(
    modules[0]?.name ?? null
  );
  const [filterText, setFilterText] = useState("");

  const totalScreens = modules.reduce((acc, m) => acc + m.screens.length, 0);

  const filteredModules = modules
    .map((m) => ({
      ...m,
      screens: m.screens.filter((s) =>
        s.toLowerCase().includes(filterText.toLowerCase())
      ),
    }))
    .filter((m) => m.screens.length > 0);

  return (
    <div className="rounded-[24px] border border-zinc-200 overflow-hidden flex flex-col h-full">
      {/* Header — tetap di atas */}
      <div className="px-3 py-2.5 border-b border-zinc-200 bg-zinc-50 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="font-semibold text-xs text-zinc-900 ">
            Modul & Layar
          </h3>
          <span className="text-[10px] text-zinc-500 tabular-nums">
            {modules.length} &bull; {totalScreens}
          </span>
        </div>
        {/* Search filter */}
        <div className="relative">
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <circle cx="7" cy="7" r="4" />
            <line x1="11" y1="11" x2="14" y2="14" />
          </svg>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Cari..."
            className="w-full rounded-lg border border-zinc-200 bg-white pl-7 pr-2 py-1 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 :ring-white"
          />
        </div>
      </div>

      {/* Scrollable list — sisa tinggi otomatis */}
      <div className="overflow-y-auto flex-1">
        <div className="divide-y divide-zinc-100 ">
        {filteredModules.map((module) => {
          const isExpanded = expandedModule === module.name;
          const moduleIcon = getModuleIcon(module.name);

          return (
            <div key={module.name}>
              {/* Module Header */}
              <button
                onClick={() => {
                  setExpandedModule(isExpanded ? null : module.name);
                  onModuleSelect?.(module.name);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                  activeModule === module.name
                    ? "bg-zinc-100 ring-1 ring-inset ring-zinc-300 "
                    : "hover:bg-zinc-50 :bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{moduleIcon}</span>
                  <span className="text-sm font-medium text-zinc-900 truncate">
                    {module.name}
                  </span>
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-500 ">
                    {module.screens.length}
                  </span>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                >
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>

              {/* Screen List */}
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-3 space-y-0.5">
                  {module.screens.map((screen) => (
                    <div
                      key={screen}
                      onClick={() => onScreenSelect?.(screen)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        activeScreen === screen
                          ? "bg-zinc-200 font-medium"
                          : "hover:bg-zinc-100 :bg-zinc-800 group"
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-zinc-400 "
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      <span className="text-xs text-zinc-600 group-hover:text-zinc-900 :text-zinc-100 transition-colors">
                        {screen}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-zinc-400 ">
              {filterText
                ? "Tidak ada layar yang cocok"
                : "Belum ada data modul"}
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function getModuleIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("autentikasi") || lower.includes("login") || lower.includes("masuk"))
    return "🔐";
  if (lower.includes("transfer")) return "💰";
  if (lower.includes("mutasi")) return "📊";
  if (lower.includes("pembayaran") || lower.includes("checkout")) return "💳";
  if (lower.includes("produk")) return "📦";
  if (lower.includes("keranjang")) return "🛍️";
  if (lower.includes("pengguna") || lower.includes("profil")) return "👤";
  if (lower.includes("cuti")) return "📋";
  if (lower.includes("izin")) return "📄";
  if (lower.includes("gaji") || lower.includes("slip")) return "💰";
  return "📱";
}
