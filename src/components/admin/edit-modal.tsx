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
      <div className="w-full max-w-md rounded-[24px] border border-hairline bg-canvas mx-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline ">
          <h2 className="font-semibold text-sm text-ink ">
            Edit {isProject ? "Project" : "Task"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-ink/40 hover:text-ink/80 :text-ink/40 hover:bg-black/5 :bg-ink transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-ink/60 block mb-1">Title</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink :ring-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-ink/60 block mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink :ring-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-ink/60 block mb-1">Status</label>
              <select
                value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink"
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
                <label className="text-[11px] font-medium text-ink/60 block mb-1">Priority</label>
                <select
                  value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="w-full rounded-[12px] border border-hairline bg-canvas px-3 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-ink"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
          </div>

          {isProject && (
            <div className="rounded-[12px] bg-surface-soft border border-hairline p-3 text-xs text-ink/60 leading-relaxed">
              <strong>ID:</strong> {target.data.id}<br />
            <strong>Created:</strong> {(target.data as any).createdAt}<br />
            <strong>Tasks:</strong> {(target.data as any).totalTasks} total
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-hairline ">
          <button onClick={onClose} className="rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink/80 hover:bg-black/5 :bg-ink transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-canvas hover:bg-ink :bg-black/10 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export type { EditTarget };
