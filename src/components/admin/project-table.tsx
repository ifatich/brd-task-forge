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
      return { bg: "bg-surface-soft", dot: "bg-ink", text: "text-ink", label: "Aktif" };
    case "completed":
      return { bg: "bg-black/5", dot: "bg-ink/60", text: "text-ink/60", label: "Selesai" };
    case "draft":
      return { bg: "bg-black/5", dot: "bg-ink/30", text: "text-ink/50", label: "Draft" };
    default:
      return { bg: "bg-black/5", dot: "bg-ink/30", text: "text-ink/50", label: status };
  }
}

function getInitials(title: string): string {
  return title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function getColorForProject(_title: string): string {
  // Monochrome — all avatars use the same surface-soft/ink palette per design.md
  return "bg-black/5 text-ink";
}

export function ProjectTable({ projects = [], onSelectProject, selectedId }: ProjectTableProps) {
  return (
    <div className="divide-y divide-hairline ">
      {projects.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-ink/40 mb-3">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-sm text-ink/40 ">Belum ada proyek</p>
          <p className="text-xs text-ink/40 mt-1">Upload BRD untuk memulai</p>
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
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all ${isSelected
                ? "bg-surface-soft border-l-2 border-ink"
                : "hover:bg-surface-soft border-l-2 border-transparent"
                }`}
            >
              {/* Avatar */}
              <div className={`hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-[24px] text-xs font-bold ${colorClass}`}>
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <span className="font-medium text-sm text-ink truncate">
                    {p.title}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${status.bg} ${status.text}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-ink/40">{p.id}</span>
                  <span className="text-ink/20 ">·</span>
                  <span className="text-[11px] text-ink/40">{p.createdAt}</span>
                </div>
              </div>

              {/* Progress & tasks */}
              <div className="hidden md:flex items-center gap-4 shrink-0">
                {tCount > 0 && (
                  <div className="hidden sm:block text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink/60 ">{tCount} tugas</span>
                      <span className="text-[10px] text-ink/40">{doneCount}/{tCount}</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-black/5 mt-1 overflow-hidden">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${tCount > 0 ? (doneCount / tCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}
                <span className="text-xs text-ink/60 hover:text-ink/80 :text-ink/40 underline underline-offset-2 cursor-pointer shrink-0">
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
