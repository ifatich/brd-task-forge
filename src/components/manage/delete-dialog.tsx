"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface DeleteDialogProps {
  projectId: string;
  projectName: string;
  taskCount: number;
  onClose: () => void;
}

export function DeleteDialog({
  projectId,
  projectName,
  taskCount,
  onClose,
}: DeleteDialogProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const canDelete = confirmText === projectName;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    // Simulate delete — in the next phase this will call an API
    await new Promise((r) => setTimeout(r, 1200));
    setIsDeleting(false);
    onClose();
    router.push("/");
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
              </svg>
            </div>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Delete Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              You are about to delete <strong>{projectName}</strong> along with all {taskCount} tasks and diagrams.
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              This action cannot be undone.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Type the project name to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={projectName}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
