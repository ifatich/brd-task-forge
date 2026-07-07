"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "./project-card";
import { ProjectToolbar, ViewMode, SortBy, FilterStatus } from "./project-toolbar";
import { ProjectItem } from "./types";
import { getProgressColor } from "@/lib/progress-utils";

function getStatusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "completed") return "Completed";
  if (status === "draft") return "Draft";
  return status;
}

export function ProjectList({ projects: initialProjects }: { projects: ProjectItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    let result = [...initialProjects];
    if (filterStatus !== "all") {
      result = result.filter((p) => p.status === filterStatus);
    }
    switch (sortBy) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "progress": result.sort((a, b) => b.progress - a.progress); break;
      case "name": result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return result;
  }, [filterStatus, sortBy, initialProjects]);

  const filterOptions = [
    { value: "all" as FilterStatus, label: "All Projects", count: initialProjects.length },
    { value: "active" as FilterStatus, label: "Active", count: initialProjects.filter((p) => p.status === "active").length },
    { value: "completed" as FilterStatus, label: "Completed", count: initialProjects.filter((p) => p.status === "completed").length },
    { value: "draft" as FilterStatus, label: "Draft", count: initialProjects.filter((p) => p.status === "draft").length },
  ];

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <ProjectToolbar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterOptions={filterOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/30 border border-white/5 py-24 text-center border-dashed">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-300 mb-1">No projects found</p>
          <p className="text-xs text-zinc-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Tasks</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Progress</th>
                <th className="text-right px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <TableRow key={project.id} project={project} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TableRow({ project }: { project: ProjectItem }) {
  const router = useRouter();
  const statusLabel = getStatusLabel(project.status);

  const statusBadge =
    project.status === "active"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : project.status === "completed"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-white/5 text-zinc-400 border-white/10";

  return (
    <tr
      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <td className="px-5 py-4">
        <div className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">{project.title}</div>
        <div className="text-xs text-zinc-500 line-clamp-1 mt-1">{project.description}</div>
      </td>
      <td className="px-5 py-4 hidden sm:table-cell">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadge}`}>
          {statusLabel}
        </span>
      </td>
      <td className="px-5 py-4 text-zinc-400 hidden md:table-cell font-mono text-xs">
        {project.taskSummary?.done || 0}/{project.taskSummary?.total || 0}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(project.progress)}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-zinc-400 w-8 text-right font-mono">
            {project.progress}%
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-xs text-zinc-500 text-right hidden lg:table-cell font-mono">
        {project.updatedAt.split(' ')[0]}
      </td>
    </tr>
  );
}
