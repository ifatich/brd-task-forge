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
      <div className="rounded-[24px] border border-dashed border-hairline p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-ink/40 ">
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
    loading: () => <div className="animate-pulse h-64 bg-black/5 rounded-[24px]" />
  }
);

const GenericDiagram = dynamic(
  () => import("@/components/diagram/generic-diagram").then((m) => m.GenericDiagram),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-64 bg-black/5 rounded-[24px]" />
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
      <header className="sticky top-0 z-50 nav-glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink/60 hover:text-ink hover:bg-black/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span className="text-ink/20">|</span>
              <div className="relative flex h-9 w-9 items-center justify-center rounded-[24px] overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-ink" />
                <span className="relative text-canvas text-sm font-bold">B</span>
              </div>
              <span className="font-semibold text-base text-ink tracking-tight">Document Processing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
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
              <h1 className="text-[64px] font-[340] leading-[1.1] tracking-[-0.015em] text-ink">
                Pratinjau Hasil Analisis
              </h1>
              <p className="text-sm text-ink/60 mt-1">
                Review task, screen, dan elemen UI yang dihasilkan AI sebelum disimpan.
              </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-[24px] border border-hairline bg-canvas p-4 text-center">
                <div className="text-2xl font-bold text-ink ">{summary?.taskCount || 0}</div>
                <div className="text-xs text-ink/60 mt-0.5">Task (Modul)</div>
              </div>
              <div className="rounded-[24px] border border-hairline bg-canvas p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 ">{summary?.screenCount || 0}</div>
                <div className="text-xs text-ink/60 mt-0.5">Screen (Sub-task)</div>
              </div>
              <div className="rounded-[24px] border border-hairline bg-canvas p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 ">{summary?.elementCount || 0}</div>
                <div className="text-xs text-ink/60 mt-0.5">Elemen UI</div>
              </div>
            </div>

            {/* AI Reasoning */}
            {previewData?.reasoning && (
              <div className="mb-6 rounded-[24px] border border-blue-200 bg-blue-50/50 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-sm text-blue-900 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  Keputusan Aggregator AI
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                  {previewData.reasoning}
                </p>
              </div>
            )}

            {/* Task list preview */}
            <div className="rounded-[24px] border border-hairline overflow-hidden mb-6">
              <div className="px-4 py-2.5 border-b border-hairline bg-surface-soft ">
                <h2 className="font-semibold text-sm text-ink ">Daftar Task & Sub-task</h2>
              </div>
              <div className="divide-y divide-zinc-100 ">
                {tasks.map((task: any, i: number) => (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedTask(expandedTask === task.title ? null : task.title)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-soft :bg-zinc-900/50 transition-colors"
                    >
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${task.priority === "high" ? "bg-red-100 text-red-700 " :
                        task.priority === "medium" ? "bg-amber-100 text-amber-700 " :
                          "bg-green-100 text-green-700 "
                        }`}>
                        {task.priority === "high" ? "Tinggi" : task.priority === "medium" ? "Sedang" : "Rendah"}
                      </span>
                      <span className="flex-1 text-sm font-medium text-ink truncate">{task.title}</span>
                      <span className="text-xs text-ink/40">{task.subTasks?.length || 0} screen</span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className={`text-ink/40 transition-transform duration-200 shrink-0 ${expandedTask === task.title ? "rotate-90" : ""}`}>
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </button>
                    {expandedTask === task.title && (
                      <div className="px-4 pb-3 space-y-1.5 bg-surface-soft/50 ">
                        <p className="text-xs text-ink/60 leading-relaxed pl-1 pb-1">{task.description}</p>
                        {task.subTasks?.map((st: any, si: number) => (
                          <div key={si} className="flex items-center gap-2.5 px-3 py-2 rounded-[24px] bg-canvas border border-hairline ">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-ink/40">
                              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                            <span className="flex-1 text-sm text-ink/80 ">{st.title}</span>
                            <div className="flex gap-1">
                              {st.elements?.slice(0, 3).map((el: string, ei: number) => (
                                <span key={ei} className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] text-amber-700 ">
                                  {el}
                                </span>
                              ))}
                              {st.elements?.length > 3 && (
                                <span className="text-[9px] text-ink/40">+{st.elements.length - 3}</span>
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
                <h2 className="text-lg font-bold text-ink mb-3 px-1">Diagram Arsitektur Modul</h2>
                <div className="bg-canvas border border-hairline rounded-[24px] p-4 ">
                  <DiagramView diagram={{ ...previewData.diagram, projectId: "preview" }} />
                </div>
              </div>

              {previewData.flowMermaid && (
                <div>
                  <h2 className="text-lg font-bold text-ink mb-3 px-1">User Flow Diagram</h2>
                  <GenericDiagram mermaidSyntax={previewData.flowMermaid} />
                </div>
              )}

              {previewData.erdMermaid && (
                <div>
                  <h2 className="text-lg font-bold text-ink mb-3 px-1">ERD Database</h2>
                  <GenericDiagram mermaidSyntax={previewData.erdMermaid} />
                </div>
              )}
            </div>

            {/* Drafts Accordion */}
            {previewData?.drafts && previewData.drafts.length > 0 && (
              <div className="rounded-[24px] border border-hairline overflow-hidden mb-6">
                <details className="group">
                  <summary className="cursor-pointer px-4 py-3 bg-surface-soft flex items-center justify-between outline-none hover:bg-black/5 :bg-zinc-800/50 transition-colors">
                    <span className="font-semibold text-sm text-ink ">
                      Lihat Hasil 5 Model (Drafts)
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/60 group-open:rotate-180 transition-transform">
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </summary>
                  <div className="p-4 bg-surface-soft border-t border-hairline space-y-4 max-h-[600px] overflow-y-auto">
                    {previewData.drafts.map((draft: any, idx: number) => {
                      const hasTasks = typeof draft === 'object' && Array.isArray(draft?.tasks);
                      return (
                        <div key={idx} className="p-4 rounded-[24px] border border-hairline bg-canvas ">
                          <h4 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs">{idx + 1}</span>
                            Draf Model {idx + 1}
                          </h4>
                          {hasTasks ? (
                            <div className="space-y-4">
                              {draft.tasks.map((t: any, ti: number) => (
                                <div key={ti} className="text-sm">
                                  <div className="font-semibold text-ink flex items-start gap-2">
                                    <span className="text-ink/40 mt-0.5">•</span>
                                    <span>{t.title}</span>
                                  </div>
                                  {t.subTasks && t.subTasks.length > 0 && (
                                    <ul className="mt-2 ml-4 border-l-2 border-hairline pl-3 space-y-2">
                                      {t.subTasks.map((st: any, si: number) => (
                                        <li key={si} className="text-ink/60 text-xs flex flex-col gap-1.5">
                                          <div className="flex items-center gap-1.5 font-medium">
                                            <span className="w-1 h-1 rounded-full bg-zinc-300 "></span>
                                            {st.title}
                                          </div>
                                          {st.elements && st.elements.length > 0 && (
                                            <div className="flex flex-wrap gap-1 ml-2.5">
                                              {st.elements.map((el: string, ei: number) => (
                                                <span key={ei} className="inline-flex items-center rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] text-ink/60 border border-hairline ">
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
                            <pre className="text-xs text-ink/80 whitespace-pre-wrap overflow-x-auto font-mono bg-surface-soft p-3 rounded-[24px] border border-hairline ">
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
            <div className="rounded-[24px] bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-0.5 text-amber-600 ">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-sm text-amber-700 ">
                Data ini masih berupa pratinjau. Klik <strong>Simpan</strong> untuk menyimpan ke database, atau <strong>Batal</strong> untuk membuang hasil dan mengulang.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="button-primary"
              >
                {isSaving ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" /> Menyimpan...</>
                ) : (
                  <><svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2"><path d="M13 13H3V3h7l3 3v7z" /><path d="M5 13V9h6v4" /></svg>
                    Simpan</>
                )}
              </button>
              <button
                onClick={handleRetry}
                className="button-secondary"
              >
                Batal
              </button>
            </div>
          </>
        ) : saved && previewData ? (
          <>
            {/* Saved — navigation cards */}
            <div className="mb-8">
              <div className="rounded-[24px] border border-green-200 bg-green-50 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 ">
                    <polyline points="4 8 7 11 12 5" /><polyline points="12 5 19 12 22 9" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-ink ">Analisis Selesai!</h1>
                <p className="text-sm text-ink/60 mt-1">
                  {summary?.taskCount} task · {summary?.screenCount} screen · {summary?.elementCount} elemen UI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <a
                href={`/project/${previewData.projectId}`}
                className="group rounded-[24px] border border-hairline bg-canvas p-5 hover:hover:border-hairline :border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[24px] bg-blue-100 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-600 ">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink group-hover:text-blue-600 :text-blue-400 transition-colors">Papan Tugas</h3>
                    <p className="text-[10px] text-ink/40 mt-0.5">Lihat task & progress di Kanban</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto text-zinc-300 group-hover:text-ink/60 transition-colors shrink-0">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </div>
              </a>
              <a
                href={`/project/${previewData.projectId}/diagram`}
                className="group rounded-[24px] border border-hairline bg-canvas p-5 hover:hover:border-hairline :border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[24px] bg-amber-100 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600 ">
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink group-hover:text-amber-600 :text-amber-400 transition-colors">Diagram Alur</h3>
                    <p className="text-[10px] text-ink/40 mt-0.5">Visual modul & alur kerja</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto text-zinc-300 group-hover:text-ink/60 transition-colors shrink-0">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </div>
              </a>
              <a
                href={`/project/${previewData.projectId}/manage`}
                className="group rounded-[24px] border border-hairline bg-canvas p-5 hover:hover:border-hairline :border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[24px] bg-purple-100 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-600 ">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink group-hover:text-purple-600 :text-purple-400 transition-colors">Detail Task</h3>
                    <p className="text-[10px] text-ink/40 mt-0.5">Kelola, export & riwayat</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto text-zinc-300 group-hover:text-ink/60 transition-colors shrink-0">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </div>
              </a>
            </div>

            <div className="text-center">
              <button
                onClick={() => { uploadStore.clear(); setSaved(false); setNotes(""); setSelectedFile(null); }}
                className="text-sm text-ink/40 hover:text-ink/60 :text-zinc-300 transition-colors underline underline-offset-2"
              >
                Upload dokumen lain
              </button>
            </div>
          </>
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded-[24px] bg-red-50 border border-red-200 p-4">
                <div className="flex gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Upload Form */}
            <div className="mb-12 animate-fade-in">
              <h1 className="text-[64px] font-[340] leading-[1.1] tracking-[-0.015em] text-ink">
                Upload BRD Baru
              </h1>
              <p className="text-xl font-[330] leading-[1.4] text-ink/70 mt-4 max-w-2xl">
                Unggah file Business Requirements Document (PDF) untuk memulai analisis AI.
              </p>
            </div>

            <div className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              {/* Step 1: Upload */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white ">
                    1
                  </span>
                  <h2 className="font-semibold text-sm text-ink ">
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-bold text-ink/60 ">
                    2
                  </span>
                  <h2 className="font-semibold text-sm text-ink ">
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
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-hairline">
                <button
                  disabled={!selectedFile}
                  onClick={handleStartAnalysis}
                  className="button-primary"
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M8 3v10" /><path d="M3 8l5 5 5-5" />
                  </svg>
                  Mulai Analisis
                </button>
                <Link
                  href="/"
                  className="button-secondary"
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
