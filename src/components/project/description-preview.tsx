"use client";

import { useState, useRef, useEffect } from "react";

interface DescriptionPreviewProps {
  description: string;
}

export function DescriptionPreview({ description }: DescriptionPreviewProps) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
  }, [description]);

  return (
    <>
      <div className="mt-4 max-w-3xl">
        <p
          ref={textRef}
          className="text-xl md:text-[20px] font-[330] leading-[1.4] text-ink/70 whitespace-pre-wrap line-clamp-5"
        >
          {description}
        </p>

        {isOverflowing && (
          <button
            onClick={() => setIsOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink transition-colors group"
          >
            Baca selengkapnya
            <svg
              width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:translate-y-0.5 transition-transform"
            >
              <path d="M8 3v10M4 9l4 4 4-4" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="w-full max-w-2xl rounded-[24px] border border-hairline bg-canvas animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline shrink-0">
              <h2 className="font-semibold text-sm text-ink">Deskripsi Lengkap</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-black/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="4" x2="12" y2="12" />
                  <line x1="12" y1="4" x2="4" y2="12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              <p className="text-sm leading-[1.7] text-ink/80 whitespace-pre-wrap font-mono">
                {description}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-hairline shrink-0 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-hairline px-4 py-2 text-xs font-medium text-ink/80 hover:bg-black/5 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
