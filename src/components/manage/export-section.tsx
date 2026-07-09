"use client";

import { useState } from "react";
import { ExportModal } from "./export-modal";

interface ExportSectionProps {
  projectId: string;
  projectName: string;
}

export function ExportSection({ projectId, projectName }: ExportSectionProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="rounded-[24px] border border-zinc-200 p-5">
        <p className="text-sm text-zinc-500 mb-4">
          Download task reports and project status for team documentation.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 :bg-zinc-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v10" />
              <path d="M3 8l5 5 5-5" />
              <path d="M3 13h10" />
            </svg>
            Select Export Format
          </button>
        </div>
      </div>

      {showModal && (
        <ExportModal
          projectId={projectId}
          projectName={projectName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
