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
                Detail
              </Link>
              <span className="text-ink/20">|</span>
              <span className="font-semibold text-sm text-ink truncate max-w-[250px]">
                {project.title}
              </span>
              <span className="inline-flex items-center rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-ink/60">
                Diagram
              </span>
            </div>
            <Link
              href={`/project/${id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-canvas hover:bg-ink/80 transition-colors"
            >
              Papan Tugas
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink ">
            Diagram Alur Visual
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Representasi visual dari modul, layar, dan alur kerja berdasarkan analisis BRD.
          </p>
        </div>

        {/* Diagram + Module Panel (linked) */}
        {diagram ? (
          <DiagramView diagram={diagram} />
        ) : (
          <div className="rounded-[24px] border border-dashed border-zinc-300 p-8 text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-zinc-300 mb-3"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2 2 4-4" />
            </svg>
            <h3 className="font-medium text-sm text-ink/60 ">
              Belum ada diagram
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Diagram akan muncul setelah AI selesai memproses dokumen BRD.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
