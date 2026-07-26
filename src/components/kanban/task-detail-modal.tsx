"use client";

import { useEffect, useRef, useState } from "react";
import { AssigneeBadge } from "./assignee-badge";
import { TeamMemberPicker } from "./team-member-picker";
import { SubTaskAssignee } from "./subtask-assignee";
import { PopoverPortal } from "@/components/ui/popover-portal";

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
  assignees: any[];
  order: number;
  subTasks: SubTaskItem[];
  isCarryOver?: boolean;
  sprints?: string[];
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

function safeArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    if (!val.trim()) return [];
    try { 
      const p = JSON.parse(val); 
      return Array.isArray(p) ? p : [val]; 
    } catch { 
      return [val]; 
    }
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
  const [currentAssignees, setCurrentAssignees] = useState<string[]>(task.assignees?.map((a: any) => a.id) || []);

  useEffect(() => {
    setCurrentAssignees(task.assignees?.map((a: any) => a.id) || []);
  }, [task.assignees]);

  // Task Edit State
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskEditForm, setTaskEditForm] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    definitionOfDone: task.definitionOfDone,
    goals: safeArray(task.goals).join("\n"),
  });
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Subtask Edit State
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [subTaskEditForm, setSubTaskEditForm] = useState({
    title: "",
    description: "",
    definitionOfDone: "",
    goals: "",
    elements: "",
  });
  const [isSavingSubTask, setIsSavingSubTask] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const assigneeButtonRef = useRef<HTMLDivElement>(null);

  const handleSaveTask = async () => {
    setIsSavingTask(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskEditForm.title,
          description: taskEditForm.description,
          priority: taskEditForm.priority,
          definitionOfDone: taskEditForm.definitionOfDone,
          goals: taskEditForm.goals.split("\n").map(g => g.trim()).filter(Boolean),
        }),
      });
      setIsEditingTask(false);
      onDataChange?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTask(false);
    }
  };

  const startEditSubTask = (sub: SubTaskItem) => {
    setEditingSubTaskId(sub.id);
    setSubTaskEditForm({
      title: sub.title,
      description: sub.description,
      definitionOfDone: sub.definitionOfDone,
      goals: safeArray(sub.goals).join("\n"),
      elements: safeArray(sub.elements).join("\n"),
    });
  };

  const handleSaveSubTask = async (subId: string) => {
    setIsSavingSubTask(true);
    try {
      await fetch(`/api/subtasks/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: subTaskEditForm.title,
          description: subTaskEditForm.description,
          definitionOfDone: subTaskEditForm.definitionOfDone,
          goals: subTaskEditForm.goals.split("\n").map(g => g.trim()).filter(Boolean),
          elements: subTaskEditForm.elements.split("\n").map(e => e.trim()).filter(Boolean),
        }),
      });
      setEditingSubTaskId(null);
      onDataChange?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSubTask(false);
    }
  };

  const handleAssigneeChange = async (memberId: string | null) => {
    let newAssignees: string[] = [];
    if (memberId) {
      newAssignees = [...currentAssignees];
      if (newAssignees.includes(memberId)) {
        newAssignees = newAssignees.filter((id) => id !== memberId);
      } else {
        newAssignees.push(memberId);
      }
    }
    setCurrentAssignees(newAssignees);

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          assignees: {
            set: newAssignees.map(id => ({ id }))
          }
        }),
      });
    } catch { }
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
      <div className="w-full max-w-lg rounded-[24px] border border-zinc-200 bg-white mx-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[84vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 shrink-0">
          <div className="flex items-start gap-2.5">
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${getPriorityColor(task.priority)}`}
            >
              {getPriorityLabel(task.priority)}
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-zinc-900 leading-tight">
                {task.title}
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {task.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 :text-zinc-300 hover:bg-zinc-100 :bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title and Edit Button */}
          <div className="flex flex-col items-end">
            {!isEditingTask && (
              <button
                onClick={() => setIsEditingTask(true)}
                className="shrink-0 px-3 py-1.5 text-xs font-medium bg-zinc-100 mb-3 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors"
              >
                Edit Task
              </button>
            )}
            <div className="flex-1 w-full">
              {isEditingTask && (
                <input
                  value={taskEditForm.title}
                  onChange={(e) => setTaskEditForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full text-lg font-bold text-zinc-900 bg-transparent border-b border-zinc-300 focus:border-zinc-900 focus:outline-none pb-1"
                  placeholder="Task Title"
                />
              )}

              {isEditingTask ? (
                <textarea
                  value={taskEditForm.description}
                  onChange={(e) => setTaskEditForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md p-2 mt-2 focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[80px]"
                  placeholder="Task Description"
                />
              ) : (
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Status, Priority & Assignee */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Status
              </h4>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 capitalize">
                {task.status === "in-progress"
                  ? "In Progress"
                  : task.status === "done"
                    ? "Done"
                    : "To Do"}
              </span>
            </div>

            {isEditingTask && (
              <div>
                <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Priority
                </h4>
                <select
                  value={taskEditForm.priority}
                  onChange={(e) => setTaskEditForm(p => ({ ...p, priority: e.target.value }))}
                  className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Assignee
              </h4>
              <div className="relative">
                <div
                  ref={assigneeButtonRef}
                  onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                  className="hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-2 group/assignee"
                >
                  {currentAssignees.length > 0 ? (
                    <>
                      <div className="flex -space-x-1.5">
                        {currentAssignees.slice(0, 4).map((id) => (
                          <AssigneeBadge key={id} assigneeId={id} size="md" showName={false} />
                        ))}
                        {currentAssignees.length > 4 && (
                          <div className="flex items-center justify-center rounded-full font-medium shrink-0 h-7 w-7 text-xs bg-zinc-100 text-zinc-400 border border-white z-10 ring-1 ring-zinc-200/50">
                            +{currentAssignees.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 truncate max-w-[200px] group-hover/assignee:text-zinc-700 transition-colors duration-150">
                        {task.assignees.map((a: any) => a.name).join(", ")}
                      </span>
                    </>
                  ) : (
                    <AssigneeBadge assigneeId={null} size="md" />
                  )}
                </div>
                <PopoverPortal
                  isOpen={showAssigneePicker}
                  onClose={() => setShowAssigneePicker(false)}
                  triggerRef={assigneeButtonRef}
                >
                  <TeamMemberPicker
                    selectedIds={currentAssignees}
                    onSelect={handleAssigneeChange}
                    onClose={() => setShowAssigneePicker(false)}
                    multiple
                  />
                </PopoverPortal>
              </div>
            </div>
          </div>

          {/* Task-level Goals */}
          {(!isEditingTask ? task.goals : true) && (
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <polyline points="8 5 8 9 11 11" />
                </svg>
                Goals / Module Goals
              </h4>
              {isEditingTask ? (
                <textarea
                  value={taskEditForm.goals}
                  onChange={(e) => setTaskEditForm(p => ({ ...p, goals: e.target.value }))}
                  className="w-full text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[80px]"
                  placeholder="Enter goals separated by new lines"
                />
              ) : (
                <ul className="space-y-1">
                  {safeArray(task.goals).map((g: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 ">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-green-500">
                        <polyline points="4 8 7 11 12 5" />
                      </svg>
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Task-level Definition of Done */}
          {(!isEditingTask ? task.definitionOfDone : true) && (
            <div>
              <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                  <polyline points="5 8 7 10 11 6" />
                </svg>
                Definition of Done — Module
              </h4>
              {isEditingTask ? (
                <textarea
                  value={taskEditForm.definitionOfDone}
                  onChange={(e) => setTaskEditForm(p => ({ ...p, definitionOfDone: e.target.value }))}
                  className="w-full text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[80px]"
                  placeholder="Task Definition of Done"
                />
              ) : (
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {task.definitionOfDone}
                  </p>
                </div>
              )}
            </div>
          )}

          {isEditingTask && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditingTask(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                disabled={isSavingTask}
                className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSavingTask ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Progress */}
          <div>
            <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Sub-task ({doneCount}/{task.subTasks.length})
            </h4>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-900 transition-all duration-300"
                style={{ width: `${task.subTasks.length > 0 ? (doneCount / task.subTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Sub-task list */}
          <div className="space-y-2">
            {task.subTasks.map((sub) => (
              <div key={sub.id} className="rounded-lg border border-zinc-200 overflow-hidden">
                {/* Sub-task header — checkbox + expand */}
                <div className="flex items-center">
                  {/* Checkbox */}
                  <span
                    onClick={() => onToggleSubTask?.(task.id, sub.id)}
                    className={`inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ml-3.5 cursor-pointer hover:opacity-80 ${sub.done
                      ? "bg-zinc-900 border-zinc-900 "
                      : "border-zinc-300 "
                      }`}
                  >
                    {sub.done && (
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white ">
                        <polyline points="3 8 6 11 13 4" />
                      </svg>
                    )}
                  </span>
                  <button
                    onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2.5 text-left hover:bg-zinc-50 :bg-zinc-900/50 transition-colors"
                  >
                    <span className={`flex-1 text-sm ${sub.done ? "text-zinc-400 line-through" : "text-zinc-800 "}`}>
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

                {/* Expanded content: DoD + Elemen UI + Edit Form */}
                {expandedSub === sub.id && (
                  <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-zinc-100 ">

                    {editingSubTaskId === sub.id ? (
                      <div className="space-y-3 bg-zinc-50 p-3 rounded-lg border border-zinc-200 mt-2">
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase">Title</label>
                          <input
                            value={subTaskEditForm.title}
                            onChange={(e) => setSubTaskEditForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full text-sm mt-1 p-1.5 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase">Description</label>
                          <textarea
                            value={subTaskEditForm.description}
                            onChange={(e) => setSubTaskEditForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full text-sm mt-1 p-1.5 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[60px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase">Goals (1 per line)</label>
                          <textarea
                            value={subTaskEditForm.goals}
                            onChange={(e) => setSubTaskEditForm(p => ({ ...p, goals: e.target.value }))}
                            className="w-full text-sm mt-1 p-1.5 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[60px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase">Definition of Done</label>
                          <textarea
                            value={subTaskEditForm.definitionOfDone}
                            onChange={(e) => setSubTaskEditForm(p => ({ ...p, definitionOfDone: e.target.value }))}
                            className="w-full text-sm mt-1 p-1.5 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[60px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase">UI Elements (1 per line)</label>
                          <textarea
                            value={subTaskEditForm.elements}
                            onChange={(e) => setSubTaskEditForm(p => ({ ...p, elements: e.target.value }))}
                            className="w-full text-sm mt-1 p-1.5 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900 min-h-[60px]"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingSubTaskId(null)}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveSubTask(sub.id)}
                            disabled={isSavingSubTask}
                            className="px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50"
                          >
                            {isSavingSubTask ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-end">
                          <button
                            onClick={() => startEditSubTask(sub)}
                            className="px-2 py-1 text-[10px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors"
                          >
                            Edit Subtask
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {sub.description}
                        </p>

                        {/* Goals */}
                        {sub.goals && safeArray(sub.goals).length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                              Goals
                            </h5>
                            <ul className="space-y-0.5">
                              {safeArray(sub.goals).map((g: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-600 ">
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-green-500">
                                    <polyline points="4 8 7 11 12 5" />
                                  </svg>
                                  {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Definition of Done */}
                        {sub.definitionOfDone && (
                          <div>
                            <h5 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                              Definition of Done
                            </h5>
                            <div className="rounded-md bg-zinc-50 border border-zinc-200 p-2.5">
                              <p className="text-xs text-zinc-600 leading-relaxed">
                                {sub.definitionOfDone}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Assignee */}
                        <div>
                          <h5 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" />
                              <path d="M14 14c0-2-2.7-4-6-4s-6 2-6 4" />
                            </svg>
                            Assignee
                          </h5>
                          <SubTaskAssignee subTask={sub} taskId={task.id} onDataChange={onDataChange} />
                        </div>

                        {/* Elemen UI */}
                        {sub.elements && safeArray(sub.elements).length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                              UI Elements
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {safeArray(sub.elements).map((el: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700 "
                                >
                                  {el}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
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
              Complete Task — move to Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
