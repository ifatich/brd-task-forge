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
  if (status === "backlog") return "Backlog";
  if (status === "draft") return "Draft";
  return status;
}

function getLatestSprintNum(sprints?: string[]) {
  if (!sprints || sprints.length === 0) return 0;
  const latest = sprints[0];
  const numMatch = latest.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : 0;
}

export function ProjectList({ projects: initialProjects }: { projects: ProjectItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("sprint");
  const [filterStatus, setFilterStatus] = useState<FilterStatus | "backlog">("active");
  const [filterSprint, setFilterSprint] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  const allSprints = useMemo(() => {
    const s = new Set<string>();
    initialProjects.forEach(p => p.sprints?.forEach(sp => s.add(sp)));
    return Array.from(s).sort((a, b) => getLatestSprintNum([b]) - getLatestSprintNum([a]));
  }, [initialProjects]);

  const allAssignees = useMemo(() => {
    const a = new Set<string>();
    initialProjects.forEach(p => p.assignees?.forEach(ass => a.add(ass)));
    return Array.from(a).sort();
  }, [initialProjects]);

  const filtered = useMemo(() => {
    let result = [...initialProjects];
    if (filterStatus !== "all") {
      result = result.filter((p) => p.status === filterStatus);
    }
    if (filterSprint !== "all") {
      result = result.filter((p) => p.sprints?.includes(filterSprint));
    }
    if (filterAssignee !== "all") {
      result = result.filter((p) => p.assignees?.includes(filterAssignee));
    }
    switch (sortBy) {
      case "sprint": 
        result.sort((a, b) => {
          const sDiff = getLatestSprintNum(b.sprints) - getLatestSprintNum(a.sprints);
          if (sDiff !== 0) return sDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "progress": result.sort((a, b) => b.progress - a.progress); break;
      case "name": result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return result;
  }, [filterStatus, filterSprint, filterAssignee, sortBy, initialProjects]);

  const filterOptions = [
    { value: "active" as FilterStatus, label: "Active", count: initialProjects.filter((p) => p.status === "active").length },
    { value: "all" as FilterStatus, label: "All Projects", count: initialProjects.length },
    { value: "backlog" as FilterStatus, label: "Backlog", count: initialProjects.filter((p) => p.status === "backlog").length },
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
        filterSprint={filterSprint}
        setFilterSprint={setFilterSprint}
        allSprints={allSprints}
        filterAssignee={filterAssignee}
        setFilterAssignee={setFilterAssignee}
        allAssignees={allAssignees}
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
      : project.status === "backlog"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : project.status === "completed"
          ? "bg-black/5 text-ink/60 border-hairline"
          : "bg-black/5 text-ink/50 border-hairline";

  return (
    <tr
      className="border-b border-hairline last:border-0 hover:bg-black/5 transition-colors cursor-pointer group"
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <td className="px-5 py-4">
        <div className="font-medium text-ink group-hover:text-ink/80 transition-colors flex flex-wrap items-center gap-2">
          {project.title}
          {project.sprints && project.sprints.length > 0 && (
            <span className="inline-flex items-center rounded bg-blue-50/50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600 border border-blue-100">
              {project.sprints[project.sprints.length - 1]}
            </span>
          )}
        </div>
        <div className="text-xs text-ink/60 line-clamp-1 mt-1">{project.description}</div>
        {project.assignees && project.assignees.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex -space-x-1">
              {project.assignees.slice(0, 3).map((name, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-white text-[7px] font-medium text-ink flex items-center justify-center border border-hairline ring-1 ring-black/5 z-10" title={name}>
                  {name.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {project.assignees.length > 3 && (
                <div className="w-4 h-4 rounded-full bg-black/5 text-[7px] font-medium text-ink/60 flex items-center justify-center border border-hairline ring-1 ring-black/5 z-0" title={`${project.assignees.length - 3} more`}>
                  +{project.assignees.length - 3}
                </div>
              )}
            </div>
            <span className="text-[10px] text-ink/50 truncate max-w-[120px]">
              {project.assignees.length === 1 ? project.assignees[0] : `${project.assignees.length} assignees`}
            </span>
          </div>
        )}
      </td>
      <td className="px-5 py-4 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadge}`}>
            {statusLabel}
          </span>
          {project.status === "backlog" && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const res = await fetch(`/api/projects/${project.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "active" })
                  });
                  if (res.ok) {
                    router.refresh();
                  }
                } catch (error) {
                  console.error("Failed to make active", error);
                }
              }}
              className="px-2 py-0.5 rounded text-[10px] font-medium border border-ink/10 text-ink hover:bg-ink hover:text-canvas transition-colors"
            >
              Make Active
            </button>
          )}
        </div>
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
