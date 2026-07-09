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
      <div className="w-full max-w-md rounded-[24px] border border-red-200 bg-canvas mx-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-100 ">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 ">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
              </svg>
            </div>
            <h2 className="font-semibold text-sm text-red-700 ">
              Delete {type === "project" ? "Project" : "Task"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-ink/40 hover:text-ink/80 :text-ink/40 hover:bg-black/5 :bg-ink transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-ink/80 leading-relaxed">
            This action will permanently delete the {type === "project" ? "project" : "task"} <strong className="text-ink ">"{name}"</strong>. All related data will also be deleted.
          </p>
          <div className="rounded-[12px] bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-600 ">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1.5">
              Type <strong className="text-ink/80 ">{name}</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={name}
              className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-hairline ">
          <button onClick={onClose} className="rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink/80 hover:bg-black/5 :bg-ink transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-canvas hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Yes, Delete {type === "project" ? "Project" : "Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
