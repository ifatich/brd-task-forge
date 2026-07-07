"use client";

import { useEffect, useRef } from "react";
import type { NodeDetail } from "@/lib/mock-diagrams";

function safeArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

interface NodeDetailModalProps {
  nodeId: string;
  nodeName: string;
  detail: NodeDetail;
  onClose: () => void;
}

export function NodeDetailModal({
  nodeId,
  nodeName,
  detail,
  onClose,
}: NodeDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
              {nodeId}
            </span>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {nodeName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" />
                <line x1="8" y1="5" x2="8" y2="9" />
                <line x1="8" y1="11" x2="8" y2="11.01" />
              </svg>
              Deskripsi
            </h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {detail.description}
            </p>
          </div>

          {/* Goals */}
          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" />
                <polyline points="8 5 8 9 11 11" />
              </svg>
              Goals / Tujuan
            </h4>
            <ul className="space-y-1.5">
              {safeArray(detail.goals).map((goal: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-green-500">
                    <polyline points="4 8 7 11 12 5" />
                  </svg>
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          {/* Definition of Done */}
          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <polyline points="5 8 7 10 11 6" />
              </svg>
              Definition of Done
            </h4>
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {detail.definitionOfDone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
