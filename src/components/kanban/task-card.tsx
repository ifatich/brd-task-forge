"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AssigneeBadge } from "./assignee-badge";
import { TeamMemberPicker } from "./team-member-picker";
import { TaskDetailModal } from "./task-detail-modal";

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
    case "high": return "bg-red-100 text-red-700 ";
    case "medium": return "bg-yellow-100 text-yellow-700 ";
    case "low": return "bg-green-100 text-green-700 ";
    default: return "bg-zinc-100 text-zinc-600 ";
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

interface TaskCardProps {
  task: TaskItem;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onDataChange?: () => void;
}

export function TaskCard({ task, onToggleSubTask, onCompleteTask, onDataChange }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showAssignPicker, setShowAssignPicker] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const doneSubTasks = task.subTasks.filter((s) => s.done).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-zinc-200 bg-white hover:transition-touch-none"
    >
      {/* Drag handle bar */}
      <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-between px-3.5 pt-3 pb-1 cursor-grab active:cursor-grabbing select-none"
        >
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityColor(task.priority)}`}
          >
            {getPriorityLabel(task.priority)}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-300 "
          >
            <circle cx="6" cy="4" r="1" />
            <circle cx="10" cy="4" r="1" />
            <circle cx="6" cy="8" r="1" />
            <circle cx="10" cy="8" r="1" />
            <circle cx="6" cy="12" r="1" />
            <circle cx="10" cy="12" r="1" />
          </svg>
        </div>

        {/* Card body — klik untuk detail */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDetail(true);
          }}
          className="px-3.5 pb-3.5 cursor-pointer space-y-2"
        >
          {/* Title — module/task name */}
          <h4 className="text-sm font-semibold text-zinc-900 leading-snug">
            {task.title}
          </h4>

          {/* Description */}
          <p className="text-xs text-zinc-500 line-clamp-2">
            {task.description}
          </p>

          {/* Progress bar sub-tasks */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-900 transition-all duration-300"
                style={{ width: `${task.subTasks.length > 0 ? (doneSubTasks / task.subTasks.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 tabular-nums shrink-0">
              {doneSubTasks}/{task.subTasks.length}
            </span>
          </div>

          {/* Sub-task checklist — interactive */}
          <div className="space-y-1">
            {task.subTasks.slice(0, 4).map((sub) => (
              <label
                key={sub.id}
                className="flex items-center gap-2 py-0.5 cursor-pointer group"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={sub.done}
                  onChange={() => onToggleSubTask?.(task.id, sub.id)}
                  className="sr-only"
                />
                <span
                  onClick={() => onToggleSubTask?.(task.id, sub.id)}
                  className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border transition-colors shrink-0 ${
                    sub.done
                      ? "bg-zinc-900 border-zinc-900 "
                      : "border-zinc-300 group-hover:border-zinc-400"
                  }`}
                >
                  {sub.done && (
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white ">
                      <polyline points="3 8 6 11 13 4" />
                    </svg>
                  )}
                </span>
                <span className={`text-[11px] leading-tight truncate ${sub.done ? "text-ink/40 line-through" : "text-ink"}`}>
                  {sub.title}
                </span>
              </label>
            ))}
            {task.subTasks.length > 4 && (
              <p className="text-[10px] text-ink/40 pl-6">
                +{task.subTasks.length - 4} more
              </p>
            )}
          </div>

          {/* Selesaikan Task button — aktif hanya jika semua sub-task selesai & belum done */}
          {task.subTasks.length > 0 && task.subTasks.every((s) => s.done) && task.status !== "done" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompleteTask?.(task.id);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-bold px-3 py-1.5 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 8 7 11 13 4" />
              </svg>
              Complete Task
            </button>
          )}

          {/* Indikasi semua sub-task selesai */}
          {task.subTasks.length > 0 && task.subTasks.every((s) => s.done) && task.status !== "done" && (
            <p className="text-[10px] text-green-600 text-center -mt-1">
              All sub-tasks completed — click the button above to complete the task
            </p>
          )}

          {/* Footer: Assignee & Task ID */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAssignPicker(!showAssignPicker);
              }}
              className="hover:opacity-80 transition-opacity"
            >
              <AssigneeBadge assigneeId={task.assigneeId} size="sm" />
            </button>
            <span className="text-[9px] text-zinc-300 font-mono">
              {task.id}
            </span>

          {/* Inline assignee picker */}
          {showAssignPicker && (
            <div
              className="absolute bottom-full left-0 mb-1 z-40 min-w-[220px]"
              onClick={(e) => e.stopPropagation()}
            >
              <TeamMemberPicker
                selectedId={task.assigneeId}
                onSelect={async (id) => {
                  setShowAssignPicker(false);
                  try {
                    await fetch(`/api/tasks/${task.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ assigneeId: id }),
                    });
                  } catch {}
                  onDataChange?.();
                }}
                onClose={() => setShowAssignPicker(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <TaskDetailModal task={task} onClose={() => setShowDetail(false)} onToggleSubTask={onToggleSubTask} onCompleteTask={onCompleteTask} onDataChange={onDataChange} />
      )}
    </div>
  );
}

