import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProjectTableProps {
  projects?: any[];
  onSelectProject?: (project: any) => void;
  selectedId?: string;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return { bg: "bg-blue-50 dark:bg-blue-950/20", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", label: "Aktif" };
    case "completed":
      return { bg: "bg-green-50 dark:bg-green-950/20", dot: "bg-green-500", text: "text-green-700 dark:text-green-400", label: "Selesai" };
    case "draft":
      return { bg: "bg-zinc-100 dark:bg-zinc-800", dot: "bg-zinc-400", text: "text-zinc-600 dark:text-zinc-400", label: "Draft" };
    default:
      return { bg: "bg-zinc-100 dark:bg-zinc-800", dot: "bg-zinc-400", text: "text-zinc-600 dark:text-zinc-400", label: status };
  }
}

function getInitials(title: string): string {
  return title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function getColorForProject(title: string): string {
  const colors = [
    "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
    "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = ((hash << 5) - hash) + title.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
}

export function ProjectTable({ projects = [], onSelectProject, selectedId }: ProjectTableProps) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {projects.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Belum ada proyek</p>
          <p className="text-xs text-zinc-400 mt-1">Upload BRD untuk memulai</p>
        </div>
      ) : (
        projects.map((p) => {
          const tCount = p.taskSummary?.total ?? 0;
          const doneCount = p.taskSummary?.done ?? 0;
          const isSelected = selectedId === p.id;
          const status = getStatusStyle(p.status);
          const initials = getInitials(p.title);
          const colorClass = getColorForProject(p.title);

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject?.(p)}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all ${
                isSelected
                  ? "bg-amber-50 dark:bg-amber-950/10 border-l-2 border-amber-500"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-l-2 border-transparent"
              }`}
            >
              {/* Avatar */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${colorClass}`}>
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {p.title}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${status.bg} ${status.text}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-zinc-400">{p.id}</span>
                  <span className="text-zinc-200 dark:text-zinc-700">·</span>
                  <span className="text-[11px] text-zinc-400">{p.createdAt}</span>
                </div>
              </div>

              {/* Progress & tasks */}
              <div className="flex items-center gap-4 shrink-0">
                {tCount > 0 && (
                  <div className="hidden sm:block text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{tCount} tugas</span>
                      <span className="text-[10px] text-zinc-400">{doneCount}/{tCount}</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${tCount > 0 ? (doneCount / tCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}
                <span className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2 cursor-pointer shrink-0">
                  Detail →
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
