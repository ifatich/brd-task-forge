"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadStore } from "@/lib/upload-store";

export function UploadStatusBanner() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState(uploadStore.getState());

  useEffect(() => {
    const unsubscribe = uploadStore.subscribe((newState) => {
      setUploadState({ ...newState });
    });
    return () => { unsubscribe(); };
  }, []);

  const { isProcessing, previewData, fileName, error } = uploadState;

  // Don't show banner if there's no processing state and no preview data ready
  if (!isProcessing && !previewData && !error) return null;

  return (
    <div className="mb-8 animate-fade-in">
      {isProcessing ? (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin text-blue-400 shrink-0">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-100">
                Memproses {fileName || "dokumen"}...
              </p>
              <p className="text-xs text-blue-400 mt-0.5">
                Estimasi: 8-10 menit. Anda dapat terus menggunakan dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/upload")}
            className="text-xs font-medium text-blue-300 hover:text-white px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 transition-colors"
          >
            Lihat Progress
          </button>
        </div>
      ) : previewData ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
                <path d="M13 5L6 12l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-100">
                ✨ Analisis {fileName || "dokumen"} selesai!
              </p>
              <p className="text-xs text-green-400 mt-0.5">
                Pratinjau struktur tugas dan diagram sudah siap.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/upload")}
            className="text-xs font-medium text-green-900 bg-green-400 hover:bg-green-300 px-4 py-2 rounded-lg transition-colors"
          >
            Lihat Hasil
          </button>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
                <path d="M4 12l8-8M4 4l8 8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-100">
                Gagal memproses {fileName || "dokumen"}
              </p>
              <p className="text-xs text-red-400 mt-0.5 line-clamp-1">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              uploadStore.clear();
              router.push("/upload");
            }}
            className="text-xs font-medium text-red-300 hover:text-white px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
          >
            Tutup
          </button>
        </div>
      ) : null}
    </div>
  );
}
