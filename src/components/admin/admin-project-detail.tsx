"use client";

import { useState, useMemo, useEffect } from "react";
import { EditModal, type EditTarget } from "./edit-modal";
import { DeleteModal } from "./delete-modal";
import { FlowDiagram } from "@/components/diagram/flow-diagram";
import { ModulePanel } from "@/components/diagram/module-panel";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  fileUrl: string;
  createdAt: string;
}

interface TaskData {
  id: string;
  projectId: string;
  title: string;
  description: string;
  goals: string;
  definitionOfDone: string;
  status: string;
  priority: string;
  order: number;
  subTasks: any[];
  assigneeMember?: any;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "bg-blue-500";
    case "completed": return "bg-green-500";
    case "draft": return "bg-zinc-300 dark:bg-zinc-600";
    default: return "bg-zinc-300 dark:bg-zinc-600";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "active": return "Active";
    case "completed": return "Completed";
    case "draft": return "Draft";
    default: return status;
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high": return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    case "low": return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
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

interface AdminProjectDetailProps {
  project: any;
  onClose: () => void;
  onProjectDeleted?: (projectId: string) => void;
}

export function AdminProjectDetail({ project, onClose, onProjectDeleted }: AdminProjectDetailProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "project" | "task"; id: string; name: string } | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addSubTaskFor, setAddSubTaskFor] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState(project);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"tasks" | "diagram">("tasks");
  const [diagramData, setDiagramData] = useState<any>(null);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${project.id}/tasks`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setTasks(data?.tasks ?? []))
      .catch(() => setTasks([]));
  }, [project.id]);

  useEffect(() => {
    if (activeTab !== "diagram") return;
    if (diagramData) return;
    setDiagramLoading(true);
    setDiagramError(null);
    fetch(`/api/projects/${project.id}/diagram`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setDiagramData(data);
        else setDiagramError("Diagram not available");
      })
      .catch(() => setDiagramError("Failed to load diagram"))
      .finally(() => setDiagramLoading(false));
  }, [activeTab, project.id, diagramData]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.subTasks.some((s: any) => s.title.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => a.order - b.order);
  }, [tasks, filterStatus, filterPriority, searchText]);

  const allTaskCount = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;

  const handleEditSave = async (updated: EditTarget) => {
    if (updated.type === "project") {
      try {
        const res = await fetch(`/api/projects/${updated.data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: updated.data.title, description: updated.data.description, status: updated.data.status }),
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentProject(data);
        }
      } catch {}
    } else {
      try {
        const res = await fetch(`/api/tasks/${updated.data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: updated.data.title,
            description: updated.data.description,
            status: updated.data.status,
            priority: updated.data.priority,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setTasks((prev) => prev.map((task) => (task.id === data.id ? data : task)));
        }
      } catch {}
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "project") {
      try {
        await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
      } catch {}
      onProjectDeleted?.(deleteTarget.id);
      onClose();
    } else {
      try {
        await fetch(`/api/tasks/${deleteTarget.id}`, { method: "DELETE" });
      } catch {}
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {currentProject.title}
              </h3>
              <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(currentProject.status)}`} />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {currentProject.id} &middot; {currentProject.createdAt} &middot; {allTaskCount} tasks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditTarget({ type: "project", data: currentProject })}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Edit project"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2l3 3-9 9H2v-3z" />
            </svg>
          </button>
          <button
            onClick={() => setDeleteTarget({ type: "project", id: currentProject.id, name: currentProject.title })}
            className="p-1.5 rounded-md text-red-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete project"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
            </svg>
          </button>
          <span className="text-[10px] text-zinc-400 capitalize">{getStatusLabel(currentProject.status)}</span>
        </div>
      </div>

      {/* Stats mini + add task */}
      <div className="flex items-stretch gap-px bg-zinc-200 dark:bg-zinc-800">
        {[
          { label: "Completed", value: doneTasks, color: "text-green-600 dark:text-green-400" },
          { label: "In Progress", value: inProgressTasks, color: "text-blue-600 dark:text-blue-400" },
          { label: "Total", value: allTaskCount, color: "text-zinc-900 dark:text-zinc-100" },
        ].map((s) => (
          <div key={s.label} className="flex-1 bg-white dark:bg-zinc-950 px-4 py-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{s.label}</div>
          </div>
        ))}
        <button
          onClick={() => setAddTaskOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-950 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12" /><path d="M2 8h12" /></svg>
          Add Task
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "tasks"
              ? "text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-white"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-transparent"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          Tasks
          <span className="text-[10px] opacity-60">({allTaskCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("diagram")}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "diagram"
              ? "text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-white"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-transparent"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Diagram
          {diagramData && <span className="text-[10px] opacity-60">· available</span>}
        </button>
        <a
          href={`/project/${currentProject.id}/diagram`}
          target="_blank"
          className="ml-auto flex items-center gap-1 px-4 py-2 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Open in new tab
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 4l4 4-4 4" /></svg>
        </a>
      </div>

      {/* ── TAB: TUGAS ── */}
      {activeTab === "tasks" && (
        <>
      {/* Filter bar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="relative">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <circle cx="7" cy="7" r="4" /><line x1="11" y1="11" x2="14" y2="14" />
          </svg>
          <input
            type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search task or sub-task..."
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {tasks.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No tasks found</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              {/* Task row */}
              <button
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${getPriorityColor(task.priority)}`}
                >
                  {getPriorityLabel(task.priority)}
                </span>
                <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {task.title}
                </span>
                <span className="text-xs text-zinc-400 tabular-nums">
                  {task.subTasks.filter((s: any) => s.done).length}/{task.subTasks.length}
                </span>
                <span className={`text-[10px] font-medium capitalize px-2 py-0.5 rounded-full ${
                  task.status === "done" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                  task.status === "in-progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {task.status === "in-progress" ? "In Progress" : task.status === "done" ? "Done" : "To Do"}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTarget({ type: "task", data: task, projectId: currentProject.id });
                  }}
                  className="p-1 rounded text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 2l3 3-9 9H2v-3z" />
                  </svg>
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ type: "task", id: task.id, name: task.title });
                  }}
                  className="p-1 rounded text-red-200 hover:text-red-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
                  </svg>
                </span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className={`text-zinc-400 transition-transform duration-200 shrink-0 ${expandedTask === task.id ? "rotate-90" : ""}`}
                >
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>

              {/* Expanded sub-tasks */}
              {expandedTask === task.id && (
                <div className="px-5 pb-3 pt-1 space-y-1 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-1 pb-1.5">
                    {task.description}
                  </p>
                  {task.subTasks.map((sub: any) => (
                    <div key={sub.id} className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-white dark:hover:bg-zinc-900 transition-colors group">
                      <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border shrink-0 transition-colors ${
                        sub.done
                          ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}>
                        {sub.done && (
                          <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-zinc-900">
                            <polyline points="3 8 6 11 13 4" />
                          </svg>
                        )}
                      </span>
                      <span className={`flex-1 text-xs ${sub.done ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-600 dark:text-zinc-400"}`}>
                        {sub.title}
                      </span>
                      <div className="flex gap-1 items-center">
                        {safeArray(sub.elements).slice(0, 3).map((el: any, i: number) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 px-1.5 py-0.5 text-[9px] text-amber-700 dark:text-amber-400">
                            {el}
                          </span>
                        ))}
                        {safeArray(sub.elements).length > 3 && (
                          <span className="text-[9px] text-zinc-400">+{safeArray(sub.elements).length - 3}</span>
                        )}
                        {/* Add element inline */}
                        <AddElementInline
                          onAdd={(el) => {
                            setTasks((prev) => prev.map((t: any) =>
                              t.id === task.id
                                ? { ...t, subTasks: t.subTasks.map((s: any) =>
                                    s.id === sub.id ? { ...s, elements: [...s.elements, el] } : s
                                  )}
                                : t
                            ));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {task.subTasks.length === 0 && (
                    <p className="text-xs text-zinc-400 pl-1 pb-1">No sub-tasks yet</p>
                  )}

                  {/* Tambah Sub-task */}
                  <div className="pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddSubTaskFor(task.id); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 px-3 py-1.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12" /><path d="M2 8h12" /></svg>
                      Add Sub-task
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
        </>
      )}

      {/* ── TAB: DIAGRAM ── */}
      {activeTab === "diagram" && (
        <div className="p-5">
          {diagramLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-zinc-400">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading diagram...</p>
              </div>
            </div>
          ) : diagramError ? (
            <div className="text-center py-12">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3">
                <circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" />
              </svg>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{diagramError}</p>
              <p className="text-xs text-zinc-400 mt-1">Upload & process BRD first to view the diagram.</p>
            </div>
          ) : diagramData ? (
            <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
              <div className="lg:col-span-7 min-w-0">
                <FlowDiagram
                  mermaidSyntax={diagramData.mermaidSyntax}
                  nodeDetails={diagramData.nodeDetails}
                  showLegend
                />
              </div>
              <div className="lg:col-span-2 flex flex-col">
                <ModulePanel
                  modules={diagramData.modules || []}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          type={deleteTarget.type}
          name={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Add Task Modal */}
      {addTaskOpen && (
        <AddTaskModal
          onAdd={async (title, description, goals, definitionOfDone) => {
            try {
              const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  projectId: currentProject.id,
                  title,
                  description,
                  goals: goals.split("\n").map((g) => g.trim()).filter(Boolean),
                  definitionOfDone,
                  order: tasks.length,
                }),
              });
              if (res.ok) {
                const data = await res.json();
                setTasks((prev) => [...prev, data]);
              }
            } catch {}
            setAddTaskOpen(false);
          }}
          onClose={() => setAddTaskOpen(false)}
        />
      )}

      {/* Add Sub-task Modal */}
      {addSubTaskFor && (
        <AddSubTaskModal
          onAdd={async (title, description, goals, definitionOfDone, elements) => {
            const taskId = addSubTaskFor;
            // Create via API
            try {
              await fetch("/api/subtasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  taskId,
                  title,
                  description,
                  goals: goals.split("\n").map((g) => g.trim()).filter(Boolean),
                  definitionOfDone,
                  elements: elements.split(",").map((e) => e.trim()).filter(Boolean),
                }),
              });
            } catch {}
            // Refetch from API
            try {
              const res = await fetch(`/api/projects/${currentProject.id}/tasks`);
              const data = await res.json();
              if (data?.tasks) setTasks(data.tasks);
            } catch {}
            setAddSubTaskFor(null);
          }}
          onClose={() => setAddSubTaskFor(null)}
        />
      )}
    </div>
  );
}

// ── Add Task Modal ──
function AddTaskModal({ onAdd, onClose }: {
  onAdd: (title: string, description: string, goals: string, definitionOfDone: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [definitionOfDone, setDefinitionOfDone] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim(), goals.trim(), definitionOfDone.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] pb-[10vh] bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Add Task</h2>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Task Title <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dashboard Module" autoFocus
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Brief description of this task"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Goals / Objectives</label>
            <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} placeholder="One line per goal&#10;e.g.&#10;Facilitate user login&#10;Multi-factor security"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Definition of Done</label>
            <textarea value={definitionOfDone} onChange={(e) => setDefinitionOfDone(e.target.value)} rows={2} placeholder="What criteria indicate this task is completed?"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()} className="rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Add Task</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Sub-task Modal ──
function AddSubTaskModal({ onAdd, onClose }: {
  onAdd: (title: string, description: string, goals: string, definitionOfDone: string, elements: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [definitionOfDone, setDefinitionOfDone] = useState("");
  const [elements, setElements] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim(), goals.trim(), definitionOfDone.trim(), elements.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] pb-[10vh] bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Add Sub-task</h2>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Sub-task Title <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Login Page" autoFocus
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description of this sub-task"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Goals / Objectives</label>
            <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} placeholder="One line per goal"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Definition of Done</label>
            <textarea value={definitionOfDone} onChange={(e) => setDefinitionOfDone(e.target.value)} rows={2} placeholder="Completion criteria for this sub-task"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">UI Elements</label>
            <textarea value={elements} onChange={(e) => setElements(e.target.value)} rows={2} placeholder="Separate with comma&#10;e.g. Email Form, Password Form, Login Button"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()} className="rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Add Sub-task</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Element Inline Button ──
function AddElementInline({ onAdd }: { onAdd: (element: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="p-0.5 rounded text-zinc-200 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors opacity-0 group-hover:opacity-100"
        title="Add UI Element"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12" /><path d="M2 8h12" /></svg>
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="text" value={value} onChange={(e) => setValue(e.target.value)}
        placeholder="element name..." autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onAdd(value.trim());
            setValue("");
            setOpen(false);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-28 rounded border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900 px-1.5 py-0.5 text-[9px] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
      />
      <button onClick={() => setOpen(false)} className="p-0.5 text-zinc-300 hover:text-zinc-500 transition-colors">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
      </button>
    </span>
  );
}
