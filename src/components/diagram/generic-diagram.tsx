"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { downloadSvgAsPng, downloadDomAsPng, downloadDomAsPdf } from "@/lib/download-utils";



interface GenericDiagramProps {
  mermaidSyntax: string;
  title?: string;
}

export function GenericDiagram({ mermaidSyntax, title = "diagram" }: GenericDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async (format: 'png' | 'pdf' | 'svg') => {
    if (!containerRef.current) return;
    setIsDownloading(true);
    try {
      const svgEl = containerRef.current.querySelector("svg");
      if (!svgEl) return;
      
      const filename = `${title}-${Date.now()}`;
      if (format === 'svg') {
        await downloadSvgAsPng(svgEl, `${filename}.svg`);
      } else if (format === 'png') {
        await downloadDomAsPng(containerRef.current, `${filename}.png`);
      } else if (format === 'pdf') {
        await downloadDomAsPdf(containerRef.current, `${filename}.pdf`);
      }
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [title]);

  useEffect(() => {
    async function renderDiagram() {
      if (!containerRef.current || !mermaidSyntax) return;
      try {
        setIsRendered(false);
        setError(null);
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            background: "transparent",
            primaryColor: "#f8fafc",
            primaryTextColor: "#1e293b",
            primaryBorderColor: "#cbd5e1",
            lineColor: "#94a3b8",
            fontSize: "12px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            edgeLabelBackground: "#ffffff",
            tertiaryColor: "#ffffff",
          },
        });
        
        const id = `mermaid-generic-${crypto.randomUUID?.()?.slice(0, 8) ?? Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidSyntax);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
            
            // Fix edge label contrast (force dark text on white background)
            svgEl.querySelectorAll(".edgeLabel, .edgeTerm").forEach((label) => {
              const el = label as HTMLElement;
              el.style.setProperty("background-color", "#ffffff", "important");
              el.style.setProperty("color", "#1e293b", "important");
            });
            
            // Force node text color to be dark for contrast
            svgEl.querySelectorAll(".nodeLabel, .node text").forEach((label) => {
              (label as HTMLElement).style.setProperty("color", "#1e293b", "important");
              (label as HTMLElement).style.setProperty("fill", "#1e293b", "important");
            });
            
            // Force node background to be light for contrast against dark text
            svgEl.querySelectorAll(".node rect, .node circle, .node polygon, .node path").forEach((shape) => {
              if (!(shape.classList.contains("label-container"))) {
                (shape as SVGElement).style.setProperty("fill", "#f8fafc", "important");
                (shape as SVGElement).style.setProperty("stroke", "#cbd5e1", "important");
              }
            });
          }
        }
        setIsRendered(true);
      } catch (err) {
        console.error("Mermaid generic render error:", err);
        setError("Gagal merender diagram.");
      }
    }
    renderDiagram();
  }, [mermaidSyntax]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500">{error}</p>
        <pre className="mt-4 p-4 text-[10px] text-left overflow-auto bg-zinc-50 dark:bg-zinc-900 rounded-lg font-mono text-zinc-700 dark:text-zinc-300">{mermaidSyntax}</pre>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-0' : 'rounded-xl border border-zinc-200 dark:border-zinc-800 relative group'} bg-white dark:bg-zinc-950 overflow-hidden flex flex-col`}>
      {!isRendered && (
        <div className="flex items-center justify-center py-24 text-sm text-zinc-400 animate-pulse h-[600px]">
          Merender diagram...
        </div>
      )}
      <div className={`w-full ${isFullscreen ? 'flex-1 h-full' : 'h-[600px] min-h-[400px] max-h-[85vh] resize-y'} overflow-hidden cursor-grab active:cursor-grabbing ${!isRendered ? "hidden" : ""}`}>
        <TransformWrapper
          initialScale={1}
          minScale={0.2}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Export Controls Overlay (Top Left) */}
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
                  <div className="px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                    {isDownloading ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v10" /><path d="M3 8l5 5 5-5" /><path d="M3 13h10" /></svg>
                    )}
                    <span className="hidden sm:inline">Unduh:</span>
                  </div>
                  <button onClick={() => handleDownload('png')} disabled={isDownloading} className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 border-r border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors">PNG</button>
                  <button onClick={() => handleDownload('pdf')} disabled={isDownloading} className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 border-r border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors">PDF</button>
                  <button onClick={() => handleDownload('svg')} disabled={isDownloading} className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors">SVG</button>
                </div>
              </div>

              {/* Zoom Controls Overlay (Top Right) */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => zoomIn()} className="p-2 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors" title="Zoom In">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button onClick={() => zoomOut()} className="p-2 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors" title="Zoom Out">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button onClick={() => resetTransform()} className="p-2 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors" title="Reset View">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  {isFullscreen ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  )}
                </button>
              </div>

              {/* Transformable Canvas */}
              <TransformComponent 
                wrapperStyle={{ width: "100%", height: "100%" }} 
                contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div ref={containerRef} className="w-full flex justify-center p-8" />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
