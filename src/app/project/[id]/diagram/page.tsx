import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DiagramView } from "@/components/diagram/diagram-view";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface ApiProject {
  id: string;
  title: string;
}

interface DiagramData {
  projectId: string;
  mermaidSyntax: string;
  modules: { name: string; screens: string[] }[];
  nodeDetails: Record<string, { description: string; goals: string[]; definitionOfDone: string }>;
  subDiagrams: Record<string, string>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchProject(id: string): Promise<ApiProject | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/projects/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, title: data.title };
  } catch {
    return null;
  }
}

async function fetchDiagram(id: string): Promise<DiagramData | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/projects/${id}/diagram`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function DiagramPage({ params }: PageProps) {
  const { id } = await params;
  const [project, diagram] = await Promise.all([
    fetchProject(id),
    fetchDiagram(id),
  ]);

  if (!project) {
    notFound();
  }

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
                Detail
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="font-semibold text-sm truncate max-w-[250px]">
                {project.title}
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Diagram
              </Badge>
            </div>
            <Link
              href={`/project/${id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 dark:bg-white px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Papan Tugas
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Diagram Alur Visual
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Representasi visual dari modul, layar, dan alur kerja berdasarkan analisis BRD.
          </p>
        </div>

        {/* Diagram + Module Panel (linked) */}
        {diagram ? (
          <DiagramView diagram={diagram} />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2 2 4-4" />
            </svg>
            <h3 className="font-medium text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada diagram
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Diagram akan muncul setelah AI selesai memproses dokumen BRD.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
