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
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/project/${id}`}
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                Task Board
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="font-semibold text-sm truncate max-w-[250px]">
                {project.title}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Project Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage project, download reports, and view activity history.
          </p>
        </div>

        <div className="space-y-8">
          {/* Ringkasan Proyek */}
          <section>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
              Project Summary
            </h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {project.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl line-clamp-3 whitespace-pre-wrap">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm">
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Created At</span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {project.createdAt}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Updated At</span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {project.updatedAt}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Total Tasks</span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {totalTasks}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {project.progress}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Daftar Tugas */}
          <section>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
              Task List
            </h2>
            <TaskList projectId={id} />
          </section>

          {/* Ekspor Laporan */}
          <section>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
              Export Report
            </h2>
            <ExportSection projectId={id} projectName={project.title} />
          </section>

          {/* Riwayat Proyek */}
          <section>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
              Project History
            </h2>
            <ProjectHistory projectId={id} />
          </section>

          {/* Hapus Proyek */}
          <section>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
              Delete Project
            </h2>
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
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
                  <h3 className="font-medium text-sm text-red-800 dark:text-red-300">
                    Delete This Project
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
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
