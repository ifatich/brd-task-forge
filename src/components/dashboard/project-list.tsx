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
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-surface-soft border border-hairline py-24 text-center border-dashed">
          <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-black/5 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/60">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <p className="text-sm font-medium text-ink mb-1">No projects found</p>
          <p className="text-xs text-ink/60">Try adjusting your filters or search terms.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-hairline bg-surface-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-black/5">
                <th className="text-left px-5 py-4 text-xs font-semibold text-ink/60 uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-ink/60 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-ink/60 uppercase tracking-wider hidden md:table-cell">Tasks</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-ink/60 uppercase tracking-wider">Progress</th>
                <th className="text-right px-5 py-4 text-xs font-semibold text-ink/60 uppercase tracking-wider hidden lg:table-cell">Updated</th>
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
      ? "bg-surface-soft text-ink border-hairline"
      : project.status === "completed"
        ? "bg-black/5 text-ink/60 border-hairline"
        : "bg-black/5 text-ink/50 border-hairline";

  return (
    <tr
      className="border-b border-hairline last:border-0 hover:bg-black/5 transition-colors cursor-pointer group"
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <td className="px-5 py-4">
        <div className="font-medium text-ink group-hover:text-ink/80 transition-colors">{project.title}</div>
        <div className="text-xs text-ink/60 line-clamp-1 mt-1">{project.description}</div>
      </td>
      <td className="px-5 py-4 hidden sm:table-cell">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadge}`}>
          {statusLabel}
        </span>
      </td>
      <td className="px-5 py-4 text-ink/60 hidden md:table-cell font-mono text-xs">
        {project.taskSummary?.done || 0}/{project.taskSummary?.total || 0}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-hairline overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(project.progress)}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-ink/60 w-8 text-right font-mono">
            {project.progress}%
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-xs text-ink/60 text-right hidden lg:table-cell font-mono">
        {project.updatedAt.split(' ')[0]}
      </td>
    </tr>
  );
}
