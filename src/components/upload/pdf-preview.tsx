"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface PdfPreviewProps {
  file: File | null;
}

export function PdfPreview({ file }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageCanvas, setPageCanvas] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfjsRef = useRef<any>(null);

  // Load pdfjs secara async (hanya di client)
  useEffect(() => {
    if (pdfjsRef.current) return;
    import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      pdfjsRef.current = mod;
    });
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!file || !pdfjsRef.current) return;

    setIsLoading(true);
    setError(null);
    setPdfDoc(null);
    setNumPages(0);
    setPageNumber(1);

    const pdfjs = pdfjsRef.current;
    const fileUrl = URL.createObjectURL(file);

    pdfjs
      .getDocument(fileUrl)
      .promise.then((doc: any) => {
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setIsLoading(false);
        setError(`Gagal memuat PDF: ${err.message}`);
      });

    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [file]);

  // Render halaman ke canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const container = canvasRef.current.parentElement;
    const maxWidth = container ? Math.min(600, container.clientWidth - 40) : 600;
    const scale = 1.5;

    pdfDoc.getPage(pageNumber).then((page: any) => {
      const viewport = page.getViewport({ scale });
      const scaled = viewport.width > maxWidth ? maxWidth / viewport.width : 1;
      const renderViewport = page.getViewport({ scale: scale * scaled });

      const canvas = canvasRef.current!;
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;

      const renderCtx = {
        canvasContext: ctx,
        viewport: renderViewport,
      };

      page.render(renderCtx);
    });
  }, [pdfDoc, pageNumber]);

  if (!file) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Unggah file PDF untuk melihat pratinjau
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Pratinjau Dokumen
          </span>
        </div>

        {numPages > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Halaman sebelumnya"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 4l-4 4 4 4" />
              </svg>
            </button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums min-w-[60px] text-center">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Halaman berikutnya"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto">
        {error ? (
          <div className="text-center p-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-red-400 mb-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500 p-6">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Memuat pratinjau...
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-lg max-w-full"
          />
        )}
      </div>
    </div>
  );
}
