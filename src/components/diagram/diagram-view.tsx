"use client";

import { useState, useCallback, useRef } from "react";
import { FlowDiagram } from "./flow-diagram";
import { ModulePanel } from "./module-panel";
import { downloadSvgAsPng, downloadDomAsPng, downloadDomAsPdf } from "@/lib/download-utils";
import type { DiagramData } from "@/lib/mock-diagrams";

interface DiagramViewProps {
  diagram: DiagramData;
}

/**
 * Maps a screen name (e.g. "Halaman Login") to a node ID in the Mermaid diagram.
 */
/**
 * Maps a module name to a node ID in the Mermaid diagram.
 * Root node A is the project, modules are B, C, D, E...
 */
function moduleToNodeId(moduleName: string, modules: DiagramData["modules"]): string | null {
  const moduleIdx = modules.findIndex((m) => m.name === moduleName);
  if (moduleIdx === -1) return null;
  // Node IDs: A (root), B=index0, C=index1, D=index2, E=index3, ...
  return String.fromCharCode(66 + moduleIdx); // 66 = 'B'
}

/**
 * Maps a screen name (e.g. "Halaman Login") to a node ID in the Mermaid diagram.
 */
function screenToNodeId(screenName: string, modules: DiagramData["modules"]): string | null {
  for (const module of modules) {
    const idx = module.screens.findIndex((s) => s === screenName);
    if (idx !== -1) {
      const moduleIdx = modules.indexOf(module);
      const moduleLetter = String.fromCharCode(66 + moduleIdx); // B, C, D...
      // Screen node IDs: moduleLetter + (idx+1) → B1, B2, C1, C2, ...
      return `${moduleLetter}${idx + 1}`;
    }
  }
  return null;
}

export function DiagramView({ diagram }: DiagramViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  // Focus mode: ketika user klik screen/module, tampilkan sub-diagram detail
  const [focusScreen, setFocusScreen] = useState<string | null>(null);
  const [focusModule, setFocusModule] = useState<string | null>(null);

  // Cari module induk dari sebuah screen
  const findParentModule = useCallback(
    (screenName: string): string | null => {
      for (const mod of diagram.modules) {
        if (mod.screens.includes(screenName)) return mod.name;
      }
      return null;
    },
    [diagram.modules]
  );

  const handleModuleSelect = useCallback(
    (moduleName: string) => {
      if (focusModule === moduleName) {
        // Klik lagi = back to full diagram
        setFocusModule(null);
        setFocusScreen(null);
      } else {
        setFocusModule(moduleName);
        setFocusScreen(null);
      }
    },
    [focusModule]
  );

  const handleScreenSelect = useCallback(
    (screenName: string) => {
      if (focusScreen === screenName) {
        setFocusScreen(null);
        setFocusModule(null);
      } else {
        setFocusScreen(screenName);
        setFocusModule(findParentModule(screenName));
      }
    },
    [focusScreen, findParentModule]
  );

  const handleReset = useCallback(() => {
    setFocusModule(null);
    setFocusScreen(null);
  }, []);

  /** Tentukan Mermaid syntax yang sedang aktif */
  const activeMermaidSyntax = useCallback((): string => {
    if (focusScreen && diagram.subDiagrams?.[focusScreen]) {
      return diagram.subDiagrams[focusScreen];
    }
    // Kalau module dipilih tanpa screen, kita coba gabung sub-diagram semua screen-nya
    if (focusModule) {
      const mod = diagram.modules.find((m) => m.name === focusModule);
      if (mod) {
        const subParts = mod.screens
          .map((s) => diagram.subDiagrams?.[s])
          .filter(Boolean);
        if (subParts.length > 1) {
          // Gabung beberapa sub-diagram jadi satu dengan menghapus baris `graph LR` duplikat
          const merged = subParts
            .map((s, i) => {
              if (i === 0) return s;
              return s!.replace(/^graph LR\n/, "");
            })
            .join("\n");
          return merged;
        }
        if (subParts.length === 1) return subParts[0]!;
      }
    }
    return diagram.mermaidSyntax;
  }, [focusScreen, focusModule, diagram]);

  const handleDownload = useCallback(async (format: 'png' | 'pdf' | 'svg') => {
    if (!diagramRef.current) return;
    setIsDownloading(true);

    try {
      const svgEl = diagramRef.current.querySelector("svg");
      const wrapperEl = diagramRef.current.querySelector(".mermaid-wrapper") as HTMLElement;
      if (!svgEl || !wrapperEl) {
        console.error("No diagram element found");
        return;
      }

      const projectName = diagram.projectId;
      const filename = `diagram-${projectName}`;
      
      if (format === 'svg') {
        await downloadSvgAsPng(svgEl, `${filename}.svg`);
      } else if (format === 'png') {
        await downloadDomAsPng(wrapperEl, `${filename}.png`);
      } else if (format === 'pdf') {
        await downloadDomAsPdf(wrapperEl, `${filename}.pdf`);
      }
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [diagram.projectId]);

  const isFocusMode = focusScreen || focusModule;
  const mermaidToRender = activeMermaidSyntax();

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <button
            onClick={handleReset}
            className={`shrink-0 font-medium transition-colors ${
              isFocusMode
                ? "text-ink/50 hover:text-ink"
                : "text-ink cursor-default"
            }`}
          >
            Full Diagram
          </button>

          {focusModule && (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink/30">
                <path d="M6 4l4 4-4 4" />
              </svg>
              <button
                onClick={() => {
                  setFocusModule(focusModule === focusModule ? focusModule : null);
                }}
                className={`shrink-0 font-medium transition-colors ${
                  focusScreen
                    ? "text-ink/50 hover:text-ink"
                    : "text-ink"
                }`}
              >
                {focusModule}
              </button>
            </>
          )}

          {focusScreen && (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink/30">
                <path d="M6 4l4 4-4 4" />
              </svg>
              <span className="text-ink font-medium truncate">
                {focusScreen}
              </span>
            </>
          )}

          {isFocusMode && (
            <span className="text-[10px] text-ink/40 ml-2 hidden sm:inline">
              &mdash; click again or &ldquo;Full Diagram&rdquo; to return
            </span>
          )}
        </div>

        <div className="flex items-center rounded-lg border border-hairline bg-canvas overflow-hidden shrink-0">
          <div className="px-3 py-1.5 text-xs text-ink/50 bg-black/5 border-r border-hairline flex items-center gap-1.5">
            {isDownloading ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v10" /><path d="M3 8l5 5 5-5" /><path d="M3 13h10" /></svg>
            )}
            <span className="hidden sm:inline">Download:</span>
          </div>
          <button onClick={() => handleDownload('png')} disabled={isDownloading} className="px-3 py-1.5 text-xs font-medium text-zinc-700 border-r border-zinc-200 hover:bg-zinc-50 :bg-zinc-800 disabled:opacity-50 transition-colors">PNG</button>
          <button onClick={() => handleDownload('pdf')} disabled={isDownloading} className="px-3 py-1.5 text-xs font-medium text-zinc-700 border-r border-zinc-200 hover:bg-zinc-50 :bg-zinc-800 disabled:opacity-50 transition-colors">PDF</button>
          <button onClick={() => handleDownload('svg')} disabled={isDownloading} className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 :bg-zinc-800 disabled:opacity-50 transition-colors">SVG</button>
        </div>
      </div>

      {/* Diagram + Module Panel — diagram takes 7/9, panel 2/9 */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
        <div ref={diagramRef} className="lg:col-span-7 min-w-0">
          <FlowDiagram
            key={mermaidToRender}
            mermaidSyntax={mermaidToRender}
            nodeDetails={diagram.nodeDetails}
            showLegend={!isFocusMode}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <ModulePanel
            modules={diagram.modules}
            activeModule={focusModule}
            activeScreen={focusScreen}
            onModuleSelect={handleModuleSelect}
            onScreenSelect={handleScreenSelect}
          />
        </div>
      </div>
    </div>
  );
}
