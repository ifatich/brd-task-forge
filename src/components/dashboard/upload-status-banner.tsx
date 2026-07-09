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
        <div className="rounded-[24px] border border-blue-500/20 bg-blue-500/10 p-4 flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin text-blue-400 shrink-0">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <div>
              <p className="text-sm font-bold text-ink">
                Processing {fileName || "document"}...
              </p>
              <p className="text-xs text-ink/70 mt-0.5">
                Estimated time: 8-10 minutes. You can continue using the dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/upload")}
            className="text-xs font-bold text-ink hover:text-ink/70 px-4 py-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
          >
            View Progress
          </button>
        </div>
      ) : previewData ? (
        <div className="rounded-[24px] border border-green-500/20 bg-green-500/10 p-4 flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
                <path d="M13 5L6 12l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">
                ✨ Analysis for {fileName || "document"} completed!
              </p>
              <p className="text-xs text-ink/70 mt-0.5">
                Task structures and diagram previews are ready.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/upload")}
            className="text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full transition-colors"
          >
            View Results
          </button>
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500">
                <path d="M4 12l8-8M4 4l8 8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">
                Failed to process {fileName || "document"}
              </p>
              <p className="text-xs text-red-500/80 mt-0.5 line-clamp-1">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              uploadStore.clear();
              router.push("/upload");
            }}
            className="text-xs font-bold text-ink hover:text-ink/70 px-4 py-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
