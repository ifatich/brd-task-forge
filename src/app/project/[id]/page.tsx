import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ProjectTabs } from "@/components/project/project-tabs";
import { ProgressIndicator } from "@/components/kanban/progress-indicator";
import { DescriptionPreview } from "@/components/project/description-preview";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function getStatusConfig(status: string): { label: string; badge: string; dot: string } {
  switch (status) {
    case "active": return { label: "Active", dot: "bg-blue-400", badge: "bg-blue-500/10 text-blue-400 border-blue-500/25" };
    case "completed": return { label: "Completed", dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" };
    case "draft": return { label: "Draft", dot: "bg-zinc-500", badge: "bg-white/5 text-muted-foreground border-white/10" };
    default: return { label: status, dot: "bg-zinc-500", badge: "bg-white/5 text-muted-foreground border-white/10" };
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
    <div className="flex flex-col flex-1 min-h-screen bg-canvas text-ink">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Left: back + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </Link>

              <span className="text-ink/20 shrink-0">|</span>

              {/* Logo mini */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-[24px] overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-ink" />
                <span className="relative text-canvas text-sm font-bold">B</span>
              </div>

              <span className="font-semibold text-base text-ink truncate tracking-tight">
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

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Project Header ── */}
        <section className="color-block-section bg-[var(--block-cream)] mb-12">
          <p className="text-sm font-bold text-ink/50 tracking-widest uppercase mb-4">
            Project
          </p>
          <h1 className="text-[42px] md:text-[64px] font-[340] leading-[1.1] tracking-[-0.015em] text-ink">
            {project.title}
          </h1>
          {project.description && (
            <DescriptionPreview description={project.description} />
          )}
        </section>

        {/* ── Progress ── */}
        <ProgressIndicator projectId={project.id} taskSummary={project.taskSummary} />

        {/* ── Tabs ── */}
        <ProjectTabs project={project} />

      </main>
    </div>
  );
}

