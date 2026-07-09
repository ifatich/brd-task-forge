"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ProgressIndicator } from "@/components/kanban/progress-indicator";
import { DiagramView } from "@/components/diagram/diagram-view";
import { GenericDiagram } from "@/components/diagram/generic-diagram";
import { ModulePanel } from "@/components/diagram/module-panel";
import { TaskList } from "@/components/manage/task-list";
import { ExportSection } from "@/components/manage/export-section";
import { ProjectHistory } from "@/components/manage/project-history";
import { DeleteDialog } from "@/components/manage/delete-dialog";
import { CurationModal } from "@/components/manage/curation-modal";
import { Badge } from "@/components/ui/badge";

// Dynamic import untuk menghindari hydration mismatch dari @dnd-kit
const KanbanBoard = dynamic(
  () => import("@/components/kanban/kanban-board").then((m) => m.KanbanBoard),
  { ssr: false }
);

type TabId = "board" | "diagram" | "manage";

interface ApiProject {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  taskSummary: { total: number; done: number; inProgress: number; todo: number };
  createdAt: string;
  updatedAt: string;
  drafts?: string;
  reasoning?: string;
  erdMermaid?: string;
  flowMermaid?: string;
}

interface DiagramData {
  projectId: string;
  mermaidSyntax: string;
  modules: { name: string; screens: string[] }[];
  nodeDetails: Record<string, { description: string; goals: string[]; definitionOfDone: string }>;
  subDiagrams: Record<string, string>;
}

interface ProjectTabsProps {
  project: ApiProject;
}
import { useRouter } from "next/navigation";

export function ProjectTabs({ project }: ProjectTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("board");
  const [diagramTab, setDiagramTab] = useState<"arch" | "erd" | "flow">("arch");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCurationModal, setShowCurationModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const handleRegenerateDiagram = async () => {
    try {
      setIsRegenerating(true);
      const res = await fetch(`/api/projects/${project.id}/diagram/regenerate`, {
        method: "POST",
      });
      if (res.ok) {
        fetchDiagram();
        router.refresh(); // Refresh to update server-side project props
      } else {
        alert("Failed to update diagram");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the diagram");
    } finally {
      setIsRegenerating(false);
    }
  };

  const fetchDiagram = useCallback(() => {
    fetch(`/api/projects/${project.id}/diagram?t=${Date.now()}`)
      .then((res) => res.ok ? res.json() : null)
      .then(setDiagram)
      .catch(() => setDiagram(null));
  }, [project.id]);

  const fetchTasks = useCallback(() => {
    fetch(`/api/projects/${project.id}/tasks?t=${Date.now()}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setTasks(data?.tasks || []);
        router.refresh();
      })
      .catch(() => setTasks([]));
  }, [project.id, router]);

  useEffect(() => {
    fetchDiagram();
    fetchTasks();
  }, [fetchDiagram, fetchTasks]);

  const totalTasks = project.taskSummary?.total ?? tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  let parsedDrafts: any[] = [];
  try {
    if (project.drafts) {
      parsedDrafts = typeof project.drafts === 'string' ? JSON.parse(project.drafts) : project.drafts;
    }
  } catch (e) {
    console.warn("Failed to parse drafts", e);
    parsedDrafts = [];
  }

  const finalTaskTitles = useMemo(() => {
    return new Set(tasks.map((t: any) => (t.title || "").toLowerCase().trim()));
  }, [tasks]);

  const finalSubTaskTitles = useMemo(() => {
    const titles = new Set<string>();
    tasks.forEach((t: any) => {
      if (t.subTasks) {
        t.subTasks.forEach((st: any) => {
           titles.add((st.title || "").toLowerCase().trim());
        });
      }
    });
    return titles;
  }, [tasks]);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "board", label: "Task Board", count: totalTasks },
    { id: "diagram", label: "Flow Diagram" },
    { id: "manage", label: "Manage" },
  ];

  return (
    <>
      {/* Navigation Tabs — horizontal scroll on mobile */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-none border-b border-hairline">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? "text-ink border-ink"
                : "text-ink/50 hover:text-ink border-transparent"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-[11px] opacity-50">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "board" && (
        <KanbanBoard projectId={project.id} onDataChange={fetchTasks} />
      )}

      {activeTab === "diagram" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            {/* Sub-tab pill toggle — scrollable on mobile */}
            <div className="flex items-center gap-1 bg-surface-soft border border-hairline p-1 rounded-full overflow-x-auto scrollbar-none w-fit">
              <button
                onClick={() => setDiagramTab("arch")}
                className={`shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${diagramTab === "arch" ? "bg-ink text-canvas" : "text-ink/60 hover:text-ink"}`}
              >
                Module Architecture
              </button>
              <button
                onClick={() => setDiagramTab("flow")}
                className={`shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${diagramTab === "flow" ? "bg-ink text-canvas" : "text-ink/60 hover:text-ink"}`}
              >
                User Flow
              </button>
              <button
                onClick={() => setDiagramTab("erd")}
                className={`shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${diagramTab === "erd" ? "bg-ink text-canvas" : "text-ink/60 hover:text-ink"}`}
              >
                Database ERD
              </button>
            </div>

            <button
              onClick={handleRegenerateDiagram}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-ink text-canvas rounded-full hover:bg-ink/80 disabled:opacity-50 transition-colors sm:ml-auto"
            >
              {isRegenerating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                  Update Diagram
                </>
              )}
            </button>
          </div>

          {diagramTab === "arch" && (
            diagram ? (
              <DiagramView diagram={diagram} />
            ) : (
              <div className="rounded-[24px] border border-dashed border-hairline p-8 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-ink/20 mb-3"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                <h3 className="font-medium text-sm text-ink/50">No architecture diagram yet</h3>
              </div>
            )
          )}

          {diagramTab === "flow" && (
            project.flowMermaid ? (
              <GenericDiagram mermaidSyntax={project.flowMermaid} />
            ) : (
              <div className="rounded-[24px] border border-dashed border-hairline p-8 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-ink/20 mb-3"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                <h3 className="font-medium text-sm text-ink/50">No User Flow yet</h3>
              </div>
            )
          )}

          {diagramTab === "erd" && (
            project.erdMermaid ? (
              <GenericDiagram mermaidSyntax={project.erdMermaid} />
            ) : (
              <div className="rounded-[24px] border border-dashed border-hairline p-8 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-ink/20 mb-3"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                <h3 className="font-medium text-sm text-ink/50">No Database ERD yet</h3>
              </div>
            )
          )}
        </div>
      )}

      {activeTab === "manage" && (
        <div className="space-y-8">
          {/* Ringkasan */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">
              Project Summary
            </h2>
            <div className="rounded-[24px] border border-hairline p-5">
              <h3 className="font-semibold text-ink">{project.title}</h3>
              <p className="text-sm text-ink/60 mt-1 max-w-xl line-clamp-3 whitespace-pre-wrap">{project.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-hairline text-sm">
                <div><span className="text-ink/50">Created</span><p className="font-medium text-ink">{project.createdAt}</p></div>
                <div><span className="text-ink/50">Total Tasks</span><p className="font-medium text-ink">{totalTasks}</p></div>
                <div><span className="text-ink/50">Completed</span><p className="font-medium text-ink">{doneTasks}</p></div>
                <div><span className="text-ink/50">Progress</span><p className="font-medium text-ink">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</p></div>
              </div>
            </div>

            {project.reasoning && (
              <div className="rounded-[24px] border border-hairline bg-surface-soft p-5 mt-4">
                <h3 className="flex items-center gap-2 font-semibold text-sm text-ink mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  AI Aggregator Decisions
                </h3>
                <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap">
                  {project.reasoning}
                </p>
              </div>
            )}

            {/* Drafts Accordion */}
            {parsedDrafts.length > 0 && (
              <div className="rounded-[24px] border border-hairline overflow-hidden mt-4">
                <details className="group">
                  <summary className="cursor-pointer px-4 py-3 bg-surface-soft flex items-center justify-between outline-none hover:bg-black/5 transition-colors">
                    <span className="font-semibold text-sm text-ink">
                      View 5 Models Output (Drafts)
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/40 group-open:rotate-180 transition-transform">
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </summary>
                  <div className="p-4 bg-surface-soft border-t border-hairline space-y-4 max-h-[600px] overflow-y-auto">
                    {parsedDrafts.map((draft: any, idx: number) => {
                      const hasTasks = typeof draft === 'object' && Array.isArray(draft?.tasks);
                      return (
                        <div key={idx} className="p-4 rounded-[24px] border border-hairline bg-canvas">
                          <h4 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-ink/70 text-xs">{idx + 1}</span>
                            Model {idx + 1} Draft
                          </h4>
                          {hasTasks ? (
                            <div className="space-y-4">
                              {draft.tasks.map((t: any, ti: number) => {
                                const isTaskUsed = finalTaskTitles.has((t.title || "").toLowerCase().trim());
                                return (
                                <div key={ti} className="text-sm">
                                  <div className={`font-semibold flex items-center gap-2 ${isTaskUsed ? "text-ink" : "text-ink/70"}`}>
                                    <span className={isTaskUsed ? "text-ink" : "text-ink/30"}>{isTaskUsed ? "✓" : "•"}</span>
                                    <span>{t.title}</span>
                                    {isTaskUsed && <span className="text-[9px] bg-black/5 text-ink/70 px-1.5 py-0.5 rounded-full border border-hairline">Used</span>}
                                  </div>
                                  {t.subTasks && t.subTasks.length > 0 && (
                                    <ul className="mt-2 ml-4 border-l-2 border-hairline pl-3 space-y-2">
                                      {t.subTasks.map((st: any, si: number) => {
                                        const isSubUsed = isTaskUsed || finalSubTaskTitles.has((st.title || "").toLowerCase().trim());
                                        return (
                                        <li key={si} className={`text-xs flex flex-col gap-1.5 ${isSubUsed ? "text-ink" : "text-ink/60"}`}>
                                          <div className="flex items-center gap-1.5 font-medium">
                                            {isSubUsed ? (
                                              <span className="w-1.5 h-1.5 rounded-full bg-ink"></span>
                                            ) : (
                                              <span className="w-1 h-1 rounded-full bg-ink/20"></span>
                                            )}
                                            {st.title}
                                          </div>
                                          {st.elements && st.elements.length > 0 && (
                                            <div className="flex flex-wrap gap-1 ml-2.5">
                                              {st.elements.map((el: string, ei: number) => (
                                                <span key={ei} className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] border ${isSubUsed ? "bg-black/5 text-ink border-hairline" : "bg-surface-soft text-ink/50 border-hairline"}`}>
                                                  {el}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </li>
                                      )})}
                                    </ul>
                                  )}
                                </div>
                              )})}
                            </div>
                          ) : (
                             <pre className="text-xs text-ink/70 whitespace-pre-wrap overflow-x-auto font-mono bg-surface-soft p-3 rounded-[12px] border border-hairline">
                               {typeof draft === "string" ? draft : JSON.stringify(draft, null, 2)}
                             </pre>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </details>
              </div>
            )}
          </section>

          {/* Daftar Tugas */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-ink">Task List</h2>
              {parsedDrafts.length > 0 && (
                <button
                  onClick={() => setShowCurationModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas px-3.5 py-1.5 text-xs font-medium text-ink/80 hover:bg-black/5 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Curate Tasks
                </button>
              )}
            </div>
            <TaskList projectId={project.id} />
          </section>

          {/* Ekspor Laporan */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">Export Report</h2>
            <ExportSection projectId={project.id} projectName={project.title} />
          </section>

          {/* Riwayat */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">Project History</h2>
            <ProjectHistory projectId={project.id} />
          </section>

          {/* Hapus */}
          <section>
            <h2 className="font-semibold text-sm text-ink mb-3">Delete Project</h2>
            <div className="rounded-[24px] border border-hairline p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink/60">
                    <path d="M2 4h12" /><path d="M5 4V2h6v2" /><path d="M3 4l1 10h8l1-10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-ink">Delete This Project</h3>
                  <p className="text-xs text-ink/60 mt-1">This action cannot be undone. All tasks, diagrams, and history will be permanently deleted.</p>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink/80 hover:bg-black/5 transition-colors"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Delete Confirmation Dialog */}
          {showDeleteDialog && (
            <DeleteDialog
              projectId={project.id}
              projectName={project.title}
              taskCount={tasks.length}
              onClose={() => setShowDeleteDialog(false)}
            />
          )}

          {/* Curation Modal */}
          {showCurationModal && (
            <CurationModal
              projectId={project.id}
              drafts={parsedDrafts}
              currentTasks={tasks}
              onClose={() => setShowCurationModal(false)}
              onSaved={fetchTasks}
            />
          )}
        </div>
      )}
    </>
  );
}
