"use client";

import { useState, useEffect, useRef } from "react";
import { downloadCsv } from "@/lib/csv-export";
import { downloadPdf } from "@/lib/pdf-export";
import type { TaskStatus } from "@/lib/mock-tasks";

type ExportFormat = "csv" | "pdf";
type ExportScope = "all" | TaskStatus;

interface ExportModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function ExportModal({ projectId, projectName, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<ExportScope>("all");
  const [isExporting, setIsExporting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (format === "csv") {
        downloadCsv(projectId, projectName, scope);
      } else {
        await downloadPdf(projectId, projectName, scope);
      }
    } catch (err) {
      console.error("Export failed:", err);
    }

    // Brief delay agar UX terasa responsif
    await new Promise((r) => setTimeout(r, 500));
    setIsExporting(false);
    onClose();
  };

  const formatOptions: {
    value: ExportFormat;
    label: string;
    desc: string;
    icon: "csv" | "pdf";
  }[] = [
    {
      value: "csv",
      label: "CSV",
      desc: "Spreadsheet — bisa dibuka di Excel / Google Sheets",
      icon: "csv",
    },
    {
      value: "pdf",
      label: "PDF",
      desc: "Dokumen — siap cetak atau dikirim ke tim",
      icon: "pdf",
    },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Ekspor Laporan
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Project name */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ekspor tugas dari <span className="font-medium text-zinc-700 dark:text-zinc-300">{projectName}</span>
          </p>

          {/* Format */}
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              Format File
            </label>
            <div className="grid grid-cols-2 gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    format === opt.value
                      ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-900 dark:ring-white"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {opt.icon === "csv" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              Status Tugas
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ExportScope)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            >
              <option value="all">Semua tugas</option>
              <option value="todo">To Do saja</option>
              <option value="in-progress">In Progress saja</option>
              <option value="done">Done saja</option>
            </select>
          </div>

          {/* Action */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Mengekspor...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v10" />
                    <path d="M3 8l5 5 5-5" />
                    <path d="M3 13h10" />
                  </svg>
                  Unduh {format.toUpperCase()}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
