"use client";

import { useState, useEffect } from "react";

interface PdfPreviewProps {
  file: File | null;
}

export function PdfPreview({ file }: PdfPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (file) {
      objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    } else {
      setUrl(null);
    }
    
    // Do not revoke immediately in cleanup to prevent Strict Mode from killing the preview
    // The browser will garbage collect the blob URL when the document unloads
  }, [file]);

  if (!file || !url) {
    return (
      <div className="rounded-[24px] border border-dashed border-hairline p-8 text-center bg-canvas">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-ink/40 mb-2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
        <p className="text-sm text-ink/60">
          Upload a PDF file to see the preview
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-hairline overflow-hidden bg-canvas">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline bg-black/5">
        <div className="flex items-center gap-2 text-xs text-ink/70">
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
          <span className="font-bold text-ink">
            Document Preview ({file.name})
          </span>
        </div>
      </div>

      {/* PDF Viewer - Aspect ratio 1:1.414 (A4) */}
      <div className="bg-black/5 flex items-start justify-center aspect-[1/1.414] w-full overflow-hidden relative">
        <embed
          src={`${url}#toolbar=0`}
          type="application/pdf"
          className="w-full h-full border-none"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
