"use client";

import { useEffect, useRef, useState } from "react";

interface DeleteModalProps {
  type: "project" | "task";
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ type, name, onClose, onConfirm }: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isValid = confirmText === name;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
              </svg>
            </div>
            <h2 className="font-semibold text-sm text-red-700 dark:text-red-400">
              Delete {type === "project" ? "Project" : "Task"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This action will permanently delete the {type === "project" ? "project" : "task"} <strong className="text-zinc-900 dark:text-zinc-200">"{name}"</strong>. All related data will also be deleted.
          </p>
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3">
            <p className="text-xs text-red-600 dark:text-red-400">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1.5">
              Type <strong className="text-zinc-700 dark:text-zinc-300">{name}</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={name}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid}
            className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Yes, Delete {type === "project" ? "Project" : "Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
