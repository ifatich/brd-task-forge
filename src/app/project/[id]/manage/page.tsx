import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskList } from "@/components/manage/task-list";
import { ExportSection } from "@/components/manage/export-section";
import { ProjectHistory } from "@/components/manage/project-history";
import { Badge } from "@/components/ui/badge";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "bg-blue-500";
    case "completed": return "bg-green-500";
    case "draft": return "bg-zinc-300 ";
    default: return "bg-zinc-300 ";
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

interface ApiProject {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  taskSummary: { total: number; done: number; inProgress: number; todo: number };
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchProject(id: string): Promise<ApiProject | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/projects/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ManageProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await fetchProject(id);

  if (!project) {
    notFound();
  }

  const totalTasks = project.taskSummary.total;
  const doneTasks = project.taskSummary.done;

  return (
    <div className="flex flex-col flex-1">
      {/* Navbar */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/project/${id}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                Task Board
              </Link>
              <span className="text-ink/20">|</span>
              <span className="font-semibold text-sm text-ink truncate max-w-[250px]">
                {project.title}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-ink ">
            Project Management
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Manage project, download reports, and view activity history.
          </p>
        </div>

        <div className="space-y-8">
          {/* Ringkasan Proyek */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">
              Project Summary
            </h2>
            <div className="rounded-[24px] border border-hairline p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink ">
                    {project.title}
                  </h3>
                  <p className="text-sm text-ink/60 mt-1 max-w-xl line-clamp-3 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="capitalize shrink-0 ml-3"
                >
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusColor(project.status)}`}
                  />
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-zinc-100 text-sm">
                <div>
                  <span className="text-ink/60 ">Created At</span>
                  <p className="font-medium text-ink ">
                    {project.createdAt}
                  </p>
                </div>
                <div>
                  <span className="text-ink/60 ">Updated At</span>
                  <p className="font-medium text-ink ">
                    {project.updatedAt}
                  </p>
                </div>
                <div>
                  <span className="text-ink/60 ">Total Tasks</span>
                  <p className="font-medium text-ink ">
                    {totalTasks}
                  </p>
                </div>
                <div>
                  <span className="text-ink/60 ">Progress</span>
                  <p className="font-medium text-ink ">
                    {project.progress}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Daftar Tugas */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">
              Task List
            </h2>
            <TaskList projectId={id} />
          </section>

          {/* Ekspor Laporan */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">
              Export Report
            </h2>
            <ExportSection projectId={id} projectName={project.title} />
          </section>

          {/* Riwayat Proyek */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">
              Project History
            </h2>
            <ProjectHistory projectId={id} />
          </section>

          {/* Hapus Proyek */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">
              Delete Project
            </h2>
            <div className="rounded-[24px] border border-red-200 bg-red-50/50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 ">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M2 4h12" />
                    <path d="M5 4V2h6v2" />
                    <path d="M3 4l1 10h8l1-10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-red-800 ">
                    Delete This Project
                  </h3>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone. All tasks, diagrams, and history will be permanently deleted.
                  </p>
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors">
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
