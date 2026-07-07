"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    background: "#ffffff",
    primaryColor: "#18181b",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#18181b",
    lineColor: "#94a3b8",
    secondaryColor: "#eff6ff",
    secondaryTextColor: "#1e3a5f",
    secondaryBorderColor: "#93c5fd",
    tertiaryColor: "#f0fdf4",
    tertiaryTextColor: "#14532d",
    tertiaryBorderColor: "#86efac",
    fontSize: "11px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    edgeLabelBackground: "#ffffff",
    nodeBorder: "#e2e8f0",
    mainBkg: "#f8fafc",
    nodeTextColor: "#1e293b",
    borderRadius: "12px",
  },
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: "basis",
    padding: 8,
    nodeSpacing: 24,
    rankSpacing: 40,

  },
});

interface NodeMeta {
  id: string;
  text: string;
}

import { NodeDetailModal } from "./node-detail-modal";
import type { NodeDetail } from "@/lib/mock-diagrams";

/**
 * Ekstrak original node ID dari id SVG Mermaid.
 * Format: "mermaid-xxx-flowchart-ORIGINAL-INDEX" → "ORIGINAL"
 * Contoh: "mermaid-81defa4a-flowchart-B1a-11" → "B1a"
 */
function extractNodeId(svgElementId: string): string {
  const match = svgElementId.match(/-flowchart-([A-Za-z0-9]+)-\d+$/);
  return match ? match[1] : svgElementId;
}

interface FlowDiagramProps {
  mermaidSyntax: string;
  showLegend?: boolean;
  nodeDetails?: Record<string, NodeDetail>;
}

export function FlowDiagram({ mermaidSyntax, showLegend = true, nodeDetails }: FlowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    name: string;
    detail: NodeDetail;
  } | null>(null);
  const nodesRef = useRef<NodeMeta[]>([]);

  // Extract node labels from Mermaid syntax
  useEffect(() => {
    const nodes: NodeMeta[] = [];
    const nodeRegex = /(\w+)\["[^\]]*?([^"[\]]+)"\]/g;
    let match;
    while ((match = nodeRegex.exec(mermaidSyntax)) !== null) {
      nodes.push({ id: match[1], text: match[2].trim() });
    }
    nodesRef.current = nodes;
  }, [mermaidSyntax]);

  const renderDiagram = useCallback(async () => {
    if (!containerRef.current || !mermaidSyntax) return;

    try {
      setIsRendered(false);
      setError(null);
      setTooltip(null);

      // Generate a unique ID so multiple diagrams on the page don't conflict
      const id = `mermaid-${crypto.randomUUID?.()?.slice(0, 8) ?? Date.now()}`;
      const { svg } = await mermaid.render(id, mermaidSyntax);

      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        // Force SVG to be visible and take space
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }
      }
      setIsRendered(true);
    } catch (err) {
      console.error("Mermaid render error:", err);
      const message =
        err instanceof Error ? err.message : "Gagal merender diagram";
      setError(`Gagal merender diagram: ${message}`);
    }
  }, [mermaidSyntax]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  // Post-processing: styling tambahan setelah diagram render
  useEffect(() => {
    if (!isRendered || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;

    // ── STEP 1: Base filter transition di <g> (scale sudah di <rect>) ──
    svgEl.querySelectorAll(".node").forEach((node) => {
      (node as SVGGElement).style.setProperty("transition", "filter 0.18s ease", "important");
    });

    // ── STEP 2: Styling per level — warna, radius, shadow ──
    svgEl.querySelectorAll(".node").forEach((node) => {
      const id = extractNodeId((node as SVGGElement).id ?? "");
      const rect = node.querySelector("rect") as SVGRectElement | null;
      if (!rect) return;

      // Level 1 = root (single uppercase letter, e.g. "A")
      // Level 2 = module (single uppercase, e.g. "B", "C")
      // Level 3 = screen (letter+digit, e.g. "B1", "C2")
      // Level 4 = component (letter+digit+letter, e.g. "B1a", "C2b")

      const isRoot = id === "A";
      const isModule = /^[B-Z]$/.test(id);
      const isScreen = /^[A-Z]\d+$/.test(id);
      const isComponent = /^[A-Z]\d+[a-z]$/.test(id);

      if (isRoot) {
        rect.setAttribute("rx", "18");
        rect.setAttribute("ry", "18");
        rect.setAttribute("fill", "#18181b");
        rect.setAttribute("stroke", "#18181b");
        rect.setAttribute("stroke-width", "0");
        // Filter shadow lebih dalam untuk root
        rect.setAttribute("filter", "drop-shadow(0 4px 12px rgba(0,0,0,0.2))");
        const label = node.querySelector(".nodeLabel");
        if (label) (label as SVGElement).style.setProperty("color", "#ffffff", "important");
      } else if (isModule) {
        rect.setAttribute("rx", "14");
        rect.setAttribute("ry", "14");
        rect.setAttribute("stroke-width", "0");
        // Warna berbeda per modul — lebih vibrant
        const colors: Record<string, [string, string]> = {
          B: ["#dbeafe", "#1e3a5f"], C: ["#d1fae5", "#14532d"],
          D: ["#fef3c7", "#78350f"], E: ["#e0e7ff", "#312e81"],
        };
        const [bg, fg] = colors[id] ?? ["#f4f4f5", "#18181b"];
        rect.setAttribute("fill", bg);
        rect.setAttribute("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.08))");
        const label = node.querySelector(".nodeLabel");
        if (label) (label as SVGElement).style.setProperty("color", fg, "important");
      } else if (isScreen) {
        rect.setAttribute("rx", "12");
        rect.setAttribute("ry", "12");
        rect.setAttribute("fill", "#eef2ff");
        rect.setAttribute("stroke", "#c7d2fe");
        rect.setAttribute("stroke-width", "1.5");
        rect.setAttribute("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.07))");
        const label = node.querySelector(".nodeLabel");
        if (label) (label as SVGElement).style.setProperty("color", "#4338ca", "important");
      } else if (isComponent) {
        rect.setAttribute("rx", "9");
        rect.setAttribute("ry", "9");
        rect.setAttribute("fill", "#fffbeb");
        rect.setAttribute("stroke", "#fde68a");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.04))");
        const label = node.querySelector(".nodeLabel");
        if (label) (label as SVGElement).style.setProperty("color", "#92400e", "important");
      }
    });

    // ── STEP 3: Styling edge paths — lebih smooth ──
    svgEl.querySelectorAll(".edgePaths path").forEach((path) => {
      path.setAttribute("stroke", "#94a3b8");
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
    });

    // ── STEP 4: Styling edge labels ──
    svgEl.querySelectorAll(".edgeLabel").forEach((label) => {
      (label as SVGElement).style.setProperty("font-size", "9px", "important");
      (label as SVGElement).style.setProperty("color", "#64748b", "important");
    });
  }, [isRendered]);

  // Interaksi: hover (tooltip + scale) + klik (modal) — delegation di SVG
  useEffect(() => {
    if (!isRendered || !containerRef.current) return;

    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;

    // ── STEP 1: Matikan pointer-events di foreignObject agar klik tembus ke rect ──
    svgEl.querySelectorAll(".node foreignObject, .node foreignObject *").forEach((el) => {
      (el as SVGElement).style.setProperty("pointer-events", "none", "important");
    });

    // ── STEP 2: Setup <rect> — pointer-events + simpan rect center untuk scale ──
    // CATATAN: CSS transform tidak bekerja di SVG rect dalam <g> bertranslate.
    //          Solusi: gunakan SVG native transform attribute (scale dari (0,0)
    //          yang merupakan center rect karena Mermaid merender rect terpusat).
    svgEl.querySelectorAll(".node > rect").forEach((rect) => {
      rect.setAttribute("style", "cursor: pointer; pointer-events: fill;");
    });

    // ── STEP 3: Hover — tampilkan tooltip + efek scale pada rect ──
    const onMouseOver = (e: Event) => {
      const nodeEl = (e.target as SVGElement).closest(".node") as SVGGElement | null;
      if (!nodeEl) return;
      const nodeId = extractNodeId(nodeEl.id ?? "");
      if (!nodeId) return;
      const meta = nodesRef.current.find((n) => n.id === nodeId);
      if (!meta) return;

      const bbox = nodeEl.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      setTooltip({
        x: bbox.left - containerRect.left + bbox.width / 2,
        y: bbox.top - containerRect.top - 6,
        text: meta.text,
      });

      // Scale pada <rect> via SVG native transform attribute (CSS transform
      // tidak bekerja di SVG rect). Mermaid merender rect terpusat di (0,0)
      // dalam koordinat grup, jadi scale(1.05) dari origin langsung = scale dari center.
      const rectEl = nodeEl.querySelector("rect") as SVGRectElement | null;
      if (rectEl) {
        rectEl.setAttribute("transform", "scale(1.05)");
      }
      nodeEl.style.filter = "brightness(1.08) drop-shadow(0 6px 16px rgba(0,0,0,0.12))";
    };

    const onMouseOut = (e: Event) => {
      const nodeEl = (e.target as SVGElement).closest(".node") as SVGGElement | null;
      if (!nodeEl) return;

      // Jangan hilangkan tooltip jika mouse masih di dalam node yang sama
      const relatedNode = (e as MouseEvent).relatedTarget
        ? ((e as MouseEvent).relatedTarget as SVGElement).closest(".node")
        : null;
      if (relatedNode === nodeEl) return;

      const rectEl = nodeEl.querySelector("rect") as SVGRectElement | null;
      if (rectEl) rectEl.removeAttribute("transform");
      nodeEl.style.filter = "";
      setTooltip(null);
    };

    // ── STEP 4: Klik — buka modal detail ──
    const onClick = (e: Event) => {
      const nodeEl = (e.target as SVGElement).closest(".node") as SVGGElement | null;
      if (!nodeEl) return;
      const nodeId = extractNodeId(nodeEl.id ?? "");
      if (!nodeId) return;

      const meta = nodesRef.current.find((n) => n.id === nodeId);
      const nodeName = meta?.text ?? nodeId;

      // Animasi bounce klik pada rect (via SVG transform attribute)
      const rectEl = nodeEl.querySelector("rect") as SVGRectElement | null;
      if (rectEl) {
        rectEl.setAttribute("transform", "scale(0.93)");
        setTimeout(() => {
          rectEl.removeAttribute("transform");
        }, 120);
      }

      if (nodeDetails?.[nodeId]) {
        setSelectedNode({ id: nodeId, name: nodeName, detail: nodeDetails[nodeId] });
      }
    };

    // ── STEP 5: Daftarkan delegation listener ──
    svgEl.addEventListener("mouseover", onMouseOver);
    svgEl.addEventListener("mouseout", onMouseOut);
    svgEl.addEventListener("click", onClick);

    return () => {
      svgEl.removeEventListener("mouseover", onMouseOver);
      svgEl.removeEventListener("mouseout", onMouseOut);
      svgEl.removeEventListener("click", onClick);
    };
  }, [isRendered, nodeDetails]);

  if (error) {
    return (
      <div className="text-center py-8">
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
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden relative">
      {/* Loading skeleton */}
      {!isRendered && (
        <div className="space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-400 py-4">
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
            Merender diagram...
          </div>
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3 mx-auto" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3 mx-auto" />
        </div>
      )}

      {/* Diagram SVG */}
      <div className={`w-full h-[600px] cursor-grab active:cursor-grabbing group ${!isRendered ? "hidden" : ""}`}>
        <TransformWrapper
          initialScale={1}
          minScale={0.2}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Controls Overlay */}
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
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div
                  ref={containerRef}
                  className="mermaid-wrapper flex justify-center p-8 [&_.node]:transition-all [&_.node]:duration-200 [&_.edgePath]:transition-all [&_.edgePath]:duration-200"
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
            {tooltip.text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900 dark:border-t-white" />
          </div>
        </div>
      )}

      {/* Interaction Legend — level hierarchy + instructions */}
      {isRendered && showLegend && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
            {/* Level 1 */}
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#18181b]" />
              <span className="text-zinc-500 dark:text-zinc-400">Project</span>
            </span>
            {/* Level 2 */}
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#dbeafe]" />
              <span className="text-zinc-500 dark:text-zinc-400">Task</span>
            </span>
            {/* Level 3 */}
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#eef2ff] border border-[#c7d2fe]" />
              <span className="text-zinc-500 dark:text-zinc-400">Sub-task</span>
            </span>
            {/* Level 4 */}
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-[#fffbeb] border border-[#fde68a]" />
              <span className="text-zinc-500 dark:text-zinc-400">Elemen UI</span>
            </span>
            {/* Separator */}
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">|</span>
            {/* Tooltip hint */}
            <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" />
                <line x1="8" y1="5" x2="8" y2="9" />
                <line x1="8" y1="11" x2="8" y2="11.01" />
              </svg>
              Hover untuk info
            </span>
            <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10l-4-4-4 4" />
              </svg>
              Klik untuk detail
            </span>
          </div>
        </div>
      )}

      {/* Node Detail Modal */}
      {selectedNode && (
        <NodeDetailModal
          nodeId={selectedNode.id}
          nodeName={selectedNode.name}
          detail={selectedNode.detail}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
