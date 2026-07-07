"use client";

import { useEffect, useRef, useState } from "react";
import { AssigneeBadge } from "./assignee-badge";
import { TeamMemberPicker } from "./team-member-picker";
import { SubTaskAssignee } from "./subtask-assignee";

type TaskStatus = "todo" | "in-progress" | "done";

interface SubTaskItem {
  id: string;
  title: string;
  description: string;
  definitionOfDone: string;
  goals: string[];
  elements: string[];
  done: boolean;
}

interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  goals: string[];
  definitionOfDone: string;
  status: TaskStatus;
  priority: string;
  assignee: string | null;
  assigneeId: string | null;
  order: number;
  subTasks: SubTaskItem[];
  assigneeMember?: any;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high": return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
    case "low": return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    default: return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "high": return "High";
    case "medium": return "Medium";
    case "low": return "Low";
    default: return priority;
  }
}

function safeArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

interface TaskDetailModalProps {
  task: TaskItem;
  onClose: () => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onDataChange?: () => void;
}

export function TaskDetailModal({ task, onClose, onToggleSubTask, onCompleteTask, onDataChange }: TaskDetailModalProps) {
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [currentAssignee, setCurrentAssignee] = useState<string | null>(task.assigneeId);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleAssigneeChange = async (memberId: string | null) => {
    setCurrentAssignee(memberId);
    setShowAssigneePicker(false);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: memberId }),
      });
    } catch {}
    onDataChange?.();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const doneCount = task.subTasks.filter((s) => s.done).length;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] pb-[8vh] bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[84vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityColor(task.priority)}`}
            >
              {getPriorityLabel(task.priority)}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              {task.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {task.title}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Status & Assignee */}
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Status
              </h4>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 capitalize">
                {task.status === "in-progress"
                  ? "In Progress"
                  : task.status === "done"
                    ? "Done"
                    : "To Do"}
              </span>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Assignee
              </h4>
              <div
                onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                className="hover:opacity-80 transition-opacity relative cursor-pointer"
              >
                <AssigneeBadge assigneeId={currentAssignee} size="md" />
                {showAssigneePicker && (
                  <div className="absolute top-full left-0 mt-1 z-50 min-w-[220px]">
                    <TeamMemberPicker
                      selectedId={currentAssignee}
                      onSelect={handleAssigneeChange}
                      onClose={() => setShowAssigneePicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Task-level Goals */}
          {task.goals && (
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <polyline points="8 5 8 9 11 11" />
                </svg>
                Goals / Tujuan Modul
              </h4>
              <ul className="space-y-1">
                {safeArray(task.goals).map((g: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-green-500">
                      <polyline points="4 8 7 11 12 5" />
                    </svg>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Task-level Definition of Done */}
          {task.definitionOfDone && (
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                  <polyline points="5 8 7 10 11 6" />
                </svg>
                Definition of Done — Modul
              </h4>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {task.definitionOfDone}
                </p>
              </div>
            </div>
          )}

          {/* Progress */}
          <div>
            <h4 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              Sub-task ({doneCount}/{task.subTasks.length})
            </h4>
            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-900 dark:bg-white transition-all duration-300"
                style={{ width: `${task.subTasks.length > 0 ? (doneCount / task.subTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Sub-task list */}
          <div className="space-y-2">
            {task.subTasks.map((sub) => (
              <div key={sub.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {/* Sub-task header — checkbox + expand */}
                <div className="flex items-center">
                  {/* Checkbox */}
                  <span
                    onClick={() => onToggleSubTask?.(task.id, sub.id)}
                    className={`inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ml-3.5 cursor-pointer hover:opacity-80 ${
                      sub.done
                        ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {sub.done && (
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-zinc-900">
                        <polyline points="3 8 6 11 13 4" />
                      </svg>
                    )}
                  </span>
                  <button
                    onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <span className={`flex-1 text-sm ${sub.done ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {sub.title}
                    </span>
                    <svg
                      width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                      className={`text-zinc-400 transition-transform duration-200 shrink-0 ${expandedSub === sub.id ? "rotate-90" : ""}`}
                    >
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </button>
                </div>

                {/* Expanded content: DoD + Elemen UI */}
                {expandedSub === sub.id && (
                  <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                    {/* Description */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {sub.description}
                    </p>

                    {/* Goals */}
                    <div>
                      <h5 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                        Goals
                      </h5>
                      <ul className="space-y-0.5">
                        {safeArray(sub.goals).map((g: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-green-500">
                              <polyline points="4 8 7 11 12 5" />
                            </svg>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Definition of Done */}
                    <div>
                      <h5 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                        Definition of Done
                      </h5>
                      <div className="rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {sub.definitionOfDone}
                        </p>
                      </div>
                    </div>

                    {/* Assignee */}
                    <div>
                      <h5 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" />
                          <path d="M14 14c0-2-2.7-4-6-4s-6 2-6 4" />
                        </svg>
                        Assignee
                      </h5>
                      <SubTaskAssignee subTask={sub} taskId={task.id} onDataChange={onDataChange} />
                    </div>

                    {/* Elemen UI */}
                    <div>
                      <h5 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                        Elemen UI
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {safeArray(sub.elements).map((el: string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
                          >
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selesaikan Task — aktif jika semua sub-task selesai */}
          {task.subTasks.length > 0 && task.subTasks.every((s) => s.done) && task.status !== "done" && (
            <button
              onClick={() => onCompleteTask?.(task.id)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium px-4 py-2.5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 8 7 11 13 4" />
              </svg>
              Selesaikan Task — pindahkan ke Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
