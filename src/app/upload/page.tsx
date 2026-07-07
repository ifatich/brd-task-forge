"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileUploadZone } from "@/components/upload/file-upload-zone";
import { NotesSection } from "@/components/upload/notes-section";
import { AiProcessingIndicator } from "@/components/upload/ai-processing-indicator";
import { uploadStore } from "@/lib/upload-store";

const PdfPreview = dynamic(
  () => import("@/components/upload/pdf-preview").then((m) => m.PdfPreview),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          Memuat pratinjau...
        </div>
      </div>
    ),
  }
);

const DiagramView = dynamic(
  () => import("@/components/diagram/diagram-view").then((m) => m.DiagramView),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
  }
);

const GenericDiagram = dynamic(
  () => import("@/components/diagram/generic-diagram").then((m) => m.GenericDiagram),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
  }
);

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  // Local state managed via global upload store
  const [uploadState, setUploadState] = useState(uploadStore.getState());

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Subscribe to upload store
  useEffect(() => {
    const unsubscribe = uploadStore.subscribe((newState) => {
      setUploadState({ ...newState });
    });
    return () => { unsubscribe(); };
  }, []);

  const handleStartAnalysis = useCallback(() => {
    if (!selectedFile) return;
    uploadStore.startAnalysis(selectedFile);
  }, [selectedFile]);

  const handleSave = useCallback(async () => {
    if (!uploadState.previewData) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/pipeline/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: uploadState.previewData.projectName,
          tasks: uploadState.previewData.tasks,
          diagram: uploadState.previewData.diagram,
          extractedText: uploadState.previewData.extractedText,
          fileName: uploadState.previewData.fileName,
          fileBuffer: uploadState.previewData.fileBuffer,
          drafts: uploadState.previewData.drafts,
          reasoning: uploadState.previewData.reasoning,
          erdMermaid: uploadState.previewData.erdMermaid,
          flowMermaid: uploadState.previewData.flowMermaid,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      const savedData = await res.json();

      // Update previewData to have projectId
      uploadStore.getState().previewData.projectId = savedData.projectId;
      setSaved(true);
    } catch {
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }, [uploadState.previewData]);

  const handleRetry = useCallback(() => {
    uploadStore.clear();
    setSaved(false);
  }, []);

  const { isProcessing, currentStage, previewData, error } = uploadState;

  const summary = previewData?.summary;
  const tasks = previewData?.tasks || [];

  return (
    <div className="flex flex-col flex-1">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 nav-glass border-b border-white/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg px-2 py-1.5 hover:bg-white/5"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span className="text-white/10">|</span>
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 shrink-0">
                <span className="relative text-zinc-100 text-xs font-bold">B</span>
              </div>
              <span className="font-semibold text-sm text-zinc-100">Document Processing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {(isProcessing || currentStage === 'error') && !previewData ? (
          <>
            <AiProcessingIndicator
              currentStage={currentStage}
              onRetry={handleRetry}
            />
          </>
        ) : previewData && !saved ? (
          <>
            {/* Preview Review — user reviews before saving */}
            <div className="mb-8">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Pratinjau Hasil Analisis
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Review task, screen, dan elemen UI yang dihasilkan AI sebelum disimpan.
              </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary?.taskCount || 0}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Task (Modul)</div>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary?.screenCount || 0}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Screen (Sub-task)</div>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary?.elementCount || 0}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Elemen UI</div>
              </div>
            </div>

            {/* AI Reasoning */}
            {previewData?.reasoning && (
              <div className="mb-6 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  Keputusan Aggregator AI
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">
                  {previewData.reasoning}
                </p>
              </div>
            )}

            {/* Task list preview */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
              <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Daftar Task & Sub-task</h2>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tasks.map((task: any, i: number) => (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedTask(expandedTask === task.title ? null : task.title)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${task.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
                        task.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                          "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        }`}>
                        {task.priority === "high" ? "Tinggi" : task.priority === "medium" ? "Sedang" : "Rendah"}
                      </span>
                      <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{task.title}</span>
                      <span className="text-xs text-zinc-400">{task.subTasks?.length || 0} screen</span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className={`text-zinc-400 transition-transform duration-200 shrink-0 ${expandedTask === task.title ? "rotate-90" : ""}`}>
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </button>
                    {expandedTask === task.title && (
                      <div className="px-4 pb-3 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-1 pb-1">{task.description}</p>
                        {task.subTasks?.map((st: any, si: number) => (
                          <div key={si} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-zinc-400">
                              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                            <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{st.title}</span>
                            <div className="flex gap-1">
                              {st.elements?.slice(0, 3).map((el: string, ei: number) => (
                                <span key={ei} className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 px-1.5 py-0.5 text-[9px] text-amber-700 dark:text-amber-400">
                                  {el}
                                </span>
                              ))}
                              {st.elements?.length > 3 && (
                                <span className="text-[9px] text-zinc-400">+{st.elements.length - 3}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Diagram Preview */}
            <div className="mb-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 px-1">Diagram Arsitektur Modul</h2>
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                  <DiagramView diagram={{ ...previewData.diagram, projectId: "preview" }} />
                </div>
              </div>

              {previewData.flowMermaid && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 px-1">User Flow Diagram</h2>
                  <GenericDiagram mermaidSyntax={previewData.flowMermaid} />
                </div>
              )}

              {previewData.erdMermaid && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 px-1">ERD Database</h2>
                  <GenericDiagram mermaidSyntax={previewData.erdMermaid} />
                </div>
              )}
            </div>

            {/* Drafts Accordion */}
            {previewData?.drafts && previewData.drafts.length > 0 && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
                <details className="group">
                  <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      Lihat Hasil 5 Model (Drafts)
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500 group-open:rotate-180 transition-transform">
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </summary>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 space-y-4 max-h-[600px] overflow-y-auto">
                    {previewData.drafts.map((draft: any, idx: number) => {
                      const hasTasks = typeof draft === 'object' && Array.isArray(draft?.tasks);
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">{idx + 1}</span>
                            Draf Model {idx + 1}
                          </h4>
                          {hasTasks ? (
                            <div className="space-y-4">
                              {draft.tasks.map((t: any, ti: number) => (
                                <div key={ti} className="text-sm">
                                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-start gap-2">
                                    <span className="text-zinc-400 mt-0.5">•</span>
                                    <span>{t.title}</span>
                                  </div>
                                  {t.subTasks && t.subTasks.length > 0 && (
                                    <ul className="mt-2 ml-4 border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 space-y-2">
                                      {t.subTasks.map((st: any, si: number) => (
                                        <li key={si} className="text-zinc-600 dark:text-zinc-400 text-xs flex flex-col gap-1.5">
                                          <div className="flex items-center gap-1.5 font-medium">
                                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                            {st.title}
                                          </div>
                                          {st.elements && st.elements.length > 0 && (
                                            <div className="flex flex-wrap gap-1 ml-2.5">
                                              {st.elements.map((el: string, ei: number) => (
                                                <span key={ei} className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                  {el}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap overflow-x-auto font-mono bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
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

            {/* Info + actions */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-4 flex items-start gap-3 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Data ini masih berupa pratinjau. Klik <strong>Simpan</strong> untuk menyimpan ke database, atau <strong>Batal</strong> untuk membuang hasil dan mengulang.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" /> Menyimpan...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2"><path d="M13 13H3V3h7l3 3v7z" /><path d="M5 13V9h6v4" /></svg>
                    Simpan</>
                )}
              </button>
              <button
                onClick={handleRetry}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </>
        ) : saved && previewData ? (
          <>
            {/* Saved — navigation cards */}
            <div className="mb-8">
              <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <polyline points="4 8 7 11 12 5" /><polyline points="12 5 19 12 22 9" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Analisis Selesai!</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {summary?.taskCount} task · {summary?.screenCount} screen · {summary?.elementCount} elemen UI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <a
                href={`/project/${previewData.projectId}`}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/30 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-600 dark:text-blue-400">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Papan Tugas</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Lihat task & progress di Kanban</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </div>
              </a>
              <a
                href={`/project/${previewData.projectId}/diagram`}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600 dark:text-amber-400">
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Diagram Alur</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Visual modul & alur kerja</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </div>
              </a>
              <a
                href={`/project/${previewData.projectId}/manage`}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/30 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-600 dark:text-purple-400">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Detail Task</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Kelola, export & riwayat</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </div>
              </a>
            </div>

            <div className="text-center">
              <button
                onClick={() => { uploadStore.clear(); setSaved(false); setNotes(""); setSelectedFile(null); }}
                className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                Upload dokumen lain
              </button>
            </div>
          </>
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-4">
                <div className="flex gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Upload Form */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Upload BRD Baru
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Unggah file Business Requirements Document (PDF) untuk memulai analisis AI.
              </p>
            </div>

            <div className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              {/* Step 1: Upload */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[11px] font-bold text-white dark:text-zinc-900">
                    1
                  </span>
                  <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Unggah File BRD
                  </h2>
                </div>
                <FileUploadZone
                  onFileSelected={setSelectedFile}
                  selectedFile={selectedFile}
                />
              </section>

              {/* Step 2: PDF Preview */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                    2
                  </span>
                  <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Pratinjau Dokumen
                  </h2>
                </div>
                <PdfPreview file={selectedFile} />
              </section>

              {/* Step 3: Notes */}
              <section>
                <NotesSection
                  value={notes}
                  onChange={setNotes}
                  disabled={!selectedFile}
                />
              </section>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={!selectedFile}
                  onClick={handleStartAnalysis}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M8 3v10" /><path d="M3 8l5 5 5-5" />
                  </svg>
                  Mulai Analisis
                </button>
                <Link
                  href="/"
                  className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Batal
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
