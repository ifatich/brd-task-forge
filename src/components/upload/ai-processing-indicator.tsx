"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export type ProcessingStage =
  | "extracting"
  | "analyzing"
  | "verifying"
  | "diagramming"
  | "done"
  | "error";

interface StageConfig {
  id: ProcessingStage;
  label: string;
  messages: string[];
}

const STAGES: StageConfig[] = [
  {
    id: "extracting",
    label: "Mengekstrak fakta dari BRD",
    messages: [
      "Membaca teks dan mengidentifikasi peran (roles)...",
      "Mengekstrak proses bisnis dan aturan sistem...",
      "Mengidentifikasi batasan sistem (out of scope)..."
    ],
  },
  {
    id: "analyzing",
    label: "Menganalisis modul & screen (paralel)",
    messages: [
      "Menjalankan 5 analisis paralel untuk akurasi optimal...",
      "Membandingkan hasil analisis untuk mengurangi bias...",
      "Memeriksa konsistensi fitur antar modul..."
    ],
  },
  {
    id: "verifying",
    label: "Memverifikasi & menggabungkan hasil",
    messages: [
      "Melakukan majority voting pada struktur modul...",
      "Menyesuaikan hasil analisis dengan fakta BRD asli...",
      "Membersihkan data dari potensi halusinasi..."
    ],
  },
  {
    id: "diagramming",
    label: "Menyusun diagram alur & ERD",
    messages: [
      "Men-generate struktur Mermaid untuk Flowchart...",
      "Men-generate struktur Mermaid untuk ERD...",
      "Menyatukan hasil akhir ke dalam satu arsitektur..."
    ],
  },
];

interface AiProcessingIndicatorProps {
  currentStage: ProcessingStage | null;
  onRetry?: () => void;
}

export function AiProcessingIndicator({
  currentStage,
  onRetry,
}: AiProcessingIndicatorProps) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const startTime = useRef<number>(Date.now());
  
  const isDone = currentStage === "done";
  const isError = currentStage === "error";
  const activeIndex = STAGES.findIndex((s) => s.id === currentStage);

  // Timer for elapsed seconds and rotating messages
  useEffect(() => {
    if (isDone || isError || !currentStage) return;
    
    // Reset start time if elapsed was somehow 0 (e.g. initial mount)
    if (elapsed === 0) {
       startTime.current = Date.now();
    }

    const interval = setInterval(() => {
      const secondsPassed = Math.floor((Date.now() - startTime.current) / 1000);
      setElapsed(secondsPassed);
      
      // Rotate message every 12 seconds
      setMessageIndex(Math.floor(secondsPassed / 12) % 3);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isDone, isError, currentStage, elapsed]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // Fake progress calculation based on time (capped at 99%)
  // Assume ~600 seconds total (10 mins max). We'll make it curve nicely.
  const calculateProgress = () => {
    if (isDone) return 100;
    if (isError) return elapsed > 0 ? Math.min((elapsed / 600) * 100, 99) : 0;
    
    // Base it on elapsed time with a logarithmic feel to slow down near the end
    // Let's use a simpler linear scaling against an 8 minute (480s) expected time
    const expectedTime = 480; 
    let percent = (elapsed / expectedTime) * 100;
    
    if (percent > 99) percent = 99; // Cap at 99% until actually done
    return Math.floor(percent);
  };

  const progressPercent = calculateProgress();

  if (!currentStage) return null;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900/50 shadow-sm animate-fade-in">
      
      {/* Header & Estimated Time */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
             {!isDone && !isError && <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />}
             {isDone ? "Analisis Selesai" : isError ? "Proses Gagal" : "Memproses Dokumen"}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Estimasi waktu: 8-10 menit
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums font-mono">
            {progressPercent}%
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
             {formatTime(elapsed)}
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${isError ? 'bg-red-500' : isDone ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progressPercent}%` }}
        >
           {!isError && !isDone && (
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12" />
           )}
        </div>
      </div>

      {/* Stage list */}
      <div className="space-y-6 relative mb-8">
        <div className="absolute top-2 bottom-2 left-[11px] w-px bg-zinc-200 dark:bg-zinc-800" />
        
        {STAGES.map((stage, idx) => {
          const isActive = idx === activeIndex && !isError && !isDone;
          const isPassed = idx < activeIndex || isDone;
          const isFailed = isError && idx === activeIndex;

          return (
            <div key={stage.id} className="relative flex gap-4">
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm border-2 transition-colors duration-300">
                {isPassed ? (
                  <div className="h-full w-full rounded-full bg-green-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 5L6 12l-3-3"/></svg>
                  </div>
                ) : isFailed ? (
                  <div className="h-full w-full rounded-full bg-red-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l8-8M4 4l8 8"/></svg>
                  </div>
                ) : isActive ? (
                   <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                ) : (
                   <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                )}
              </div>

              <div className="flex-1 pb-2">
                <h4 className={`text-sm font-semibold transition-colors duration-300 ${isActive || isPassed ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}>
                  {stage.label}
                </h4>
                
                {/* Rotating Messages */}
                <div className={`mt-1.5 overflow-hidden transition-all duration-500 ${isActive ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic animate-fade-in flex items-center gap-2">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-blue-500"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                     {stage.messages[messageIndex % stage.messages.length]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        {!isDone && !isError && (
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Kembali ke Dashboard, saya akan cek nanti
          </button>
        )}
        
        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 12a6 6 0 101.01-7.99" />
            </svg>
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
