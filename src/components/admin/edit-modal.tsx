"use client";

import { useEffect, useRef, useState } from "react";

type EditTarget =
  | { type: "project"; data: any }
  | { type: "task"; data: any; projectId: string };

interface EditModalProps {
  target: EditTarget;
  onClose: () => void;
  onSave: (target: EditTarget) => void;
}

export function EditModal({ target, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(target.data.title);
  const [description, setDescription] = useState(
    "description" in target.data ? target.data.description : ""
  );
  const [status, setStatus] = useState<string>(target.data.status);
  const [priority, setPriority] = useState<string>(
    "priority" in target.data ? target.data.priority : "medium"
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    if (target.type === "project") {
      onSave({
        type: "project",
        data: { ...target.data, title, description, status },
      });
    } else {
      onSave({
        type: "task",
        data: { ...target.data, title, description, status, priority },
        projectId: target.projectId,
      });
    }
    onClose();
  };

  const isProject = target.type === "project";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Edit {isProject ? "Project" : "Task"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Title</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Status</label>
              <select
                value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {isProject ? (
                  <>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </>
                ) : (
                  <>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </>
                )}
              </select>
            </div>

            {!isProject && (
              <div>
                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Priority</label>
                <select
                  value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
          </div>

          {isProject && (
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <strong>ID:</strong> {target.data.id}<br />
            <strong>Created:</strong> {(target.data as any).createdAt}<br />
            <strong>Tasks:</strong> {(target.data as any).totalTasks} total
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export type { EditTarget };
