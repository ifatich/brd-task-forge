import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ProjectTabs } from "@/components/project/project-tabs";
import { ProgressIndicator } from "@/components/kanban/progress-indicator";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function getStatusConfig(status: string): { label: string; badge: string; dot: string } {
  switch (status) {
    case "active":    return { label: "Active",    dot: "bg-blue-400",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/25" };
    case "completed": return { label: "Completed",  dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" };
    case "draft":     return { label: "Draft",      dot: "bg-zinc-500",   badge: "bg-white/5 text-muted-foreground border-white/10" };
    default:          return { label: status,        dot: "bg-zinc-500",   badge: "bg-white/5 text-muted-foreground border-white/10" };
  }
}

interface ApiProject {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  taskSummary: { total: number; done: number; inProgress: number; todo: number };
  createdAt: string;
  updatedAt: string;
  fileUrl?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchProject(id: string): Promise<ApiProject | null> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${BASE_URL}/api/projects/${id}`, { 
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = await fetchProject(id);

  if (!project) notFound();

  const statusConfig = getStatusConfig(project.status);

  return (
    <div className="flex flex-col flex-1 min-h-screen">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Left: back + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-lg px-2 py-1.5 hover:bg-white/5"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </Link>

              <span className="text-white/15 shrink-0">|</span>

              {/* Logo mini */}
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
                <span className="relative text-white text-xs font-bold">B</span>
              </div>

              <span className="font-semibold text-sm truncate text-foreground">
                {project.title}
              </span>
            </div>

            {/* Right: status badge */}
            <span className={`inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${statusConfig.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Project Header ── */}
        <div className="mb-8 animate-float-up">
          <p className="text-xs font-semibold text-blue-400/80 tracking-widest uppercase mb-2">
            Project
          </p>
          <h1 className="text-3xl font-bold text-foreground gradient-text leading-tight">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-3 max-w-3xl leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {project.description}
            </p>
          )}
        </div>

        {/* ── Progress ── */}
        <ProgressIndicator projectId={project.id} taskSummary={project.taskSummary} />

        {/* ── Tabs ── */}
        <ProjectTabs project={project} />

      </main>
    </div>
  );
}

