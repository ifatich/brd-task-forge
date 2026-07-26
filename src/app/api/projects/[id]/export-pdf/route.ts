import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/projects/[id]/export-pdf
 *
 * Visual language follows DESIGN.md ("Figma marketing" system):
 * - Monochrome chrome (black/white) for nav-style header, footer, body copy.
 * - Every task is rendered as one full-width pastel "color-block section"
 *   (rounded corners, generous padding), rotating through the documented
 *   block palette (lime -> lilac -> cream -> mint -> pink -> coral).
 * - Sub-tasks sit *inside* the color block as plain white hairline-bordered
 *   cards — the monochrome-inside-color-block contrast is the signature move.
 * - Status uses the system's actual semantic tokens: green checkmark glyph
 *   for Done, solid black pill (selected-tab style) for In Progress, white
 *   hairline pill for To Do. Priority is a caption label, not a new color —
 *   DESIGN.md explicitly disallows inventing accent colors outside the
 *   documented block/semantic palette.
 * - figmaSans -> Helvetica, figmaMono -> Courier (documented substitutes).
 *
 * Card heights are computed with a measure pass (same layout functions,
 * draw=false) before anything is drawn, so every block fits its content
 * exactly. Every line of text is still checked against remaining page space
 * individually, so nothing is ever cut off — content simply flows to a new
 * page when a block doesn't fit.
 */

// ── Design tokens (approximated from DESIGN.md) ─────────────────
const COLORS = {
  ink: [17, 17, 17] as [number, number, number],
  inverseInk: [255, 255, 255] as [number, number, number],
  canvas: [255, 255, 255] as [number, number, number],
  inverseCanvas: [12, 12, 12] as [number, number, number],
  surfaceSoft: [244, 244, 242] as [number, number, number],
  hairline: [214, 214, 210] as [number, number, number],
  hairlineSoft: [230, 230, 227] as [number, number, number],
  primary: [12, 12, 12] as [number, number, number],
  onPrimary: [255, 255, 255] as [number, number, number],

  semanticSuccess: [22, 163, 74] as [number, number, number],

  blockLime: [214, 250, 132] as [number, number, number],
  blockLilac: [222, 213, 255] as [number, number, number],
  blockCream: [248, 238, 217] as [number, number, number],
  blockMint: [201, 244, 223] as [number, number, number],
  blockPink: [255, 213, 227] as [number, number, number],
  blockCoral: [255, 184, 161] as [number, number, number],
  blockNavy: [26, 23, 68] as [number, number, number],
};

// Rotating story-block palette (order mirrors the home-page rhythm in DESIGN.md)
const BLOCK_ROTATION: [number, number, number][] = [
  COLORS.blockLime,
  COLORS.blockLilac,
  COLORS.blockCream,
  COLORS.blockMint,
  COLORS.blockPink,
  COLORS.blockCoral,
];

const MARGIN_LEFT = 16;
const MARGIN_RIGHT = 16;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 18;
const BLOCK_PADDING = 9; // {spacing.xxl} scaled down for print
const SUB_PADDING = 4.5;
const BLOCK_RADIUS = 5; // {rounded.lg} scaled down
const SUB_RADIUS = 2; // {rounded.md}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      include: { subTasks: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    const moduleDiagram = await prisma.moduleDiagram.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    const { default: JsPDF } = await import("jspdf");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const PAGE_WIDTH = doc.internal.pageSize.width;
    const PAGE_HEIGHT = doc.internal.pageSize.height;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const FULL_PAGE_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

    // ── Low-level helpers ──────────────────────────────────────
    const setColor = (mode: "text" | "fill" | "draw", c: [number, number, number]) => {
      if (mode === "text") doc.setTextColor(c[0], c[1], c[2]);
      else if (mode === "fill") doc.setFillColor(c[0], c[1], c[2]);
      else doc.setDrawColor(c[0], c[1], c[2]);
    };

    /** Adds a new page when `needed` mm won't fit; no-op while only measuring. */
    const ensureSpace = (y: number, needed: number, draw: boolean): number => {
      if (!draw) return y;
      if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        return MARGIN_TOP;
      }
      return y;
    };

    /** figmaMono substitute: Courier, uppercase, used only for eyebrows/captions/taxonomy. */
    const drawEyebrow = (x: number, y: number, label: string, color: [number, number, number]) => {
      doc.setFont("courier", "normal");
      doc.setFontSize(7.6);
      setColor("text", color);
      doc.text(label.toUpperCase(), x, y);
    };

    /** Solid black pill, white text — mirrors `pricing-tab-selected` / `button-primary`. */
    const drawSolidPill = (x: number, y: number, text: string): number => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.6);
      const padX = 3.2;
      const w = doc.getTextWidth(text) + padX * 2;
      const h = 5.4;
      setColor("fill", COLORS.primary);
      doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");
      setColor("text", COLORS.onPrimary);
      doc.text(text, x + padX, y + h - 1.75);
      return w;
    };

    /** White pill, hairline border, black text — mirrors `pricing-tab-default`. */
    const drawOutlinePill = (x: number, y: number, text: string): number => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.6);
      const padX = 3.2;
      const w = doc.getTextWidth(text) + padX * 2;
      const h = 5.4;
      setColor("fill", COLORS.canvas);
      doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");
      setColor("draw", COLORS.ink);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, w, h, h / 2, h / 2, "S");
      setColor("text", COLORS.ink);
      doc.text(text, x + padX, y + h - 1.75);
      return w;
    };

    /** Green checkmark glyph — mirrors `comparison-checkmark`. Returns width consumed. */
    const drawCheckGlyph = (x: number, y: number): number => {
      const d = 4.6;
      const cx = x + d / 2;
      const cy = y + d / 2;
      setColor("fill", COLORS.semanticSuccess);
      doc.circle(cx, cy, d / 2, "F");
      setColor("draw", COLORS.onPrimary);
      doc.setLineWidth(0.6);
      doc.line(cx - 1.3, cy, cx - 0.3, cy + 1.1);
      doc.line(cx - 0.3, cy + 1.1, cx + 1.4, cy - 1.2);
      return d;
    };

    /** Status indicator matching DESIGN.md semantic tokens; returns width consumed. */
    const drawStatusIndicator = (x: number, y: number, status: "done" | "in-progress" | "todo"): number => {
      if (status === "done") {
        const glyphW = drawCheckGlyph(x, y - 0.2);
        doc.setFont("courier", "normal");
        doc.setFontSize(7.6);
        setColor("text", COLORS.ink);
        doc.text("DONE", x + glyphW + 1.8, y + 4);
        return glyphW + 1.8 + doc.getTextWidth("DONE");
      }
      if (status === "in-progress") return drawSolidPill(x, y, "IN PROGRESS");
      return drawOutlinePill(x, y, "TO DO");
    };

    const renderParagraph = (
      x: number,
      y: number,
      maxWidth: number,
      text: string,
      opts: { fontSize?: number; fontStyle?: string; color?: [number, number, number]; lineHeight?: number },
      draw: boolean
    ): number => {
      const fontSize = opts.fontSize ?? 9.2;
      const fontStyle = opts.fontStyle ?? "normal";
      const color = opts.color ?? COLORS.ink;
      const lineHeight = opts.lineHeight ?? 4.3;

      doc.setFont("helvetica", fontStyle);
      doc.setFontSize(fontSize);
      if (draw) setColor("text", color);

      const lines: string[] = doc.splitTextToSize(text, maxWidth);
      let cy = y;
      for (const line of lines) {
        cy = ensureSpace(cy, lineHeight, draw);
        if (draw) doc.text(line, x, cy);
        cy += lineHeight;
      }
      return cy;
    };

    const renderBulletList = (
      x: number,
      y: number,
      maxWidth: number,
      items: string[],
      opts: { fontSize?: number; color?: [number, number, number]; lineHeight?: number },
      draw: boolean
    ): number => {
      const fontSize = opts.fontSize ?? 9.2;
      const color = opts.color ?? COLORS.ink;
      const lineHeight = opts.lineHeight ?? 4.3;
      const bulletIndent = 4.2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);

      let cy = y;
      for (const item of items) {
        const lines: string[] = doc.splitTextToSize(item, maxWidth - bulletIndent);
        lines.forEach((line, i) => {
          cy = ensureSpace(cy, lineHeight, draw);
          if (draw) {
            if (i === 0) doc.text("\u2013", x, cy); // en-dash, matches editorial/eyebrow restraint
            setColor("text", color);
            doc.text(line, x + bulletIndent, cy);
          }
          cy += lineHeight;
        });
      }
      return cy;
    };

    const renderLabel = (x: number, y: number, label: string, draw: boolean): number => {
      const cy = ensureSpace(y, 6, draw);
      if (draw) drawEyebrow(x, cy, label, COLORS.ink);
      return cy + 4.6;
    };

    // ── Sub-task card layout (used both to measure and to draw) ─
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layoutSubtask = (
      st: any,
      taskIndex: number,
      stIndex: number,
      x: number,
      y: number,
      width: number,
      draw: boolean
    ): number => {
      const stGoals = safeJson(st.goals);
      const elements = safeJson(st.elements);

      let cy = ensureSpace(y, 10, draw);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      const subLabel = `${taskIndex + 1}.${stIndex + 1}  ${st.title}`;
      const subTitleLines: string[] = doc.splitTextToSize(subLabel, width - 24);
      if (draw) {
        setColor("text", COLORS.ink);
        doc.text(subTitleLines[0], x, cy);
        const w = doc.getTextWidth(subTitleLines[0]);
        drawStatusIndicator(x + w + 4, cy - 3.9, st.done ? "done" : "todo");
      }
      cy += 5;
      for (let li = 1; li < subTitleLines.length; li++) {
        cy = ensureSpace(cy, 5, draw);
        if (draw) doc.text(subTitleLines[li], x, cy);
        cy += 5;
      }
      cy += 1.5;

      let hasDetail = false;

      if (st.description) {
        hasDetail = true;
        cy = renderLabel(x, cy, "Deskripsi", draw);
        cy = renderParagraph(x, cy, width, st.description, { fontSize: 8.9 }, draw);
        cy += 3;
      }
      if (stGoals.length > 0) {
        hasDetail = true;
        cy = renderLabel(x, cy, "Goals", draw);
        cy = renderBulletList(x, cy, width, stGoals, { fontSize: 8.9 }, draw);
        cy += 3;
      }
      if (st.definitionOfDone) {
        hasDetail = true;
        cy = renderLabel(x, cy, "Definition of Done", draw);
        cy = renderParagraph(x, cy, width, st.definitionOfDone, { fontSize: 8.9 }, draw);
        cy += 3;
      }
      if (elements.length > 0) {
        hasDetail = true;
        cy = renderLabel(x, cy, "UI Elements", draw);
        cy = renderBulletList(x, cy, width, elements, { fontSize: 8.9 }, draw);
        cy += 3;
      }

      if (!hasDetail) {
        cy = ensureSpace(cy, 5, draw);
        if (draw) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8.6);
          setColor("text", COLORS.hairline);
          doc.text("Tidak ada detail tambahan", x, cy);
        }
        cy += 5;
      }
      return cy;
    };

    // ── Task color-block layout (header + body + nested sub cards) ─
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layoutTask = (task: any, index: number, x: number, y: number, width: number, draw: boolean): number => {
      let cy = ensureSpace(y, 12, draw);

      if (draw) drawEyebrow(x, cy, `Task ${String(index + 1).padStart(2, "0")}`, COLORS.ink);
      cy += 6.5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      const titleLines: string[] = doc.splitTextToSize(task.title, width);
      if (draw) {
        setColor("text", COLORS.ink);
        doc.text(titleLines[0], x, cy);
      }
      cy += 6.5;
      for (let li = 1; li < titleLines.length; li++) {
        cy = ensureSpace(cy, 6, draw);
        if (draw) doc.text(titleLines[li], x, cy);
        cy += 6;
      }
      cy += 1.5;

      cy = ensureSpace(cy, 7, draw);
      if (draw) {
        let bx = x;
        bx += drawStatusIndicator(bx, cy - 4, task.status === "done" ? "done" : task.status === "in-progress" ? "in-progress" : "todo") + 5;
        const priorityLabel = `${(task.priority || "medium").toUpperCase()} PRIORITY`;
        drawEyebrow(bx, cy, priorityLabel, COLORS.ink);
      }
      cy += 5;

      const sectionX = x;
      const sectionWidth = width;

      if (task.description) {
        cy = renderLabel(sectionX, cy, "Deskripsi", draw);
        cy = renderParagraph(sectionX, cy, sectionWidth, task.description, {}, draw);
        cy += 4;
      }

      const tGoals = safeJson(task.goals);
      if (tGoals.length > 0) {
        cy = renderLabel(sectionX, cy, "Goals", draw);
        cy = renderBulletList(sectionX, cy, sectionWidth, tGoals, {}, draw);
        cy += 4;
      }

      if (task.definitionOfDone) {
        cy = renderLabel(sectionX, cy, "Definition of Done", draw);
        cy = renderParagraph(sectionX, cy, sectionWidth, task.definitionOfDone, {}, draw);
        cy += 4;
      }

      // ── Sub-task cards: plain white, nested inside this color block ──
      if (task.subTasks.length > 0) {
        cy += 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        task.subTasks.forEach((st: any, stIndex: number) => {
          const innerWidth = width - SUB_PADDING * 2;
          const measuredH = layoutSubtask(st, index, stIndex, 0, 0, innerWidth, false);
          const cardHeight = measuredH + SUB_PADDING * 2;

          if (draw) {
            cy = ensureSpace(cy, Math.min(cardHeight, FULL_PAGE_HEIGHT), true);
            const visibleH = Math.min(cardHeight, PAGE_HEIGHT - MARGIN_BOTTOM - cy);

            setColor("fill", COLORS.canvas);
            doc.roundedRect(x, cy, width, visibleH, SUB_RADIUS, SUB_RADIUS, "F");
            setColor("draw", COLORS.hairline);
            doc.setLineWidth(0.3);
            doc.roundedRect(x, cy, width, visibleH, SUB_RADIUS, SUB_RADIUS, "S");

            cy += SUB_PADDING;
            cy = layoutSubtask(st, index, stIndex, x + SUB_PADDING, cy, innerWidth, true);
            cy += SUB_PADDING - 2;
          } else {
            cy += cardHeight;
          }
          cy += 4;
        });
      }

      return cy;
    };

    let currentY = MARGIN_TOP;

    // ── Cover: monochrome inverse header block ─────────────────
    setColor("fill", COLORS.inverseCanvas);
    doc.rect(0, 0, PAGE_WIDTH, 56, "F");

    drawEyebrow(MARGIN_LEFT, 16, "Project Report", COLORS.inverseInk);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    setColor("text", COLORS.inverseInk);
    const titleLines: string[] = doc.splitTextToSize(project.title, CONTENT_WIDTH);
    let coverY = 27;
    titleLines.forEach((line) => {
      doc.text(line, MARGIN_LEFT, coverY);
      coverY += 8.5;
    });

    const stats: [string, string][] = [
      ["Status", project.status.toUpperCase()],
      ["Total Tasks", String(tasks.length)],
      ["Dibuat", new Date(project.createdAt).toLocaleDateString("id-ID")],
    ];
    let statX = MARGIN_LEFT;
    stats.forEach(([label, value]) => {
      drawEyebrow(statX, 47, label, [180, 180, 180]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      setColor("text", COLORS.inverseInk);
      doc.text(value, statX, 52.5);
      statX += Math.max(doc.getTextWidth(value), doc.getTextWidth(label.toUpperCase())) + 16;
    });

    currentY = 68;

    // ── Tasks, each its own rotating pastel color-block section ──
    tasks.forEach((task, index) => {
      const measuredH = layoutTask(task, index, 0, 0, CONTENT_WIDTH - BLOCK_PADDING * 2, false);
      const blockHeight = measuredH + BLOCK_PADDING * 2;

      currentY = ensureSpace(currentY, Math.min(blockHeight, FULL_PAGE_HEIGHT), true);
      const visibleH = Math.min(blockHeight, PAGE_HEIGHT - MARGIN_BOTTOM - currentY);

      const blockColor = BLOCK_ROTATION[index % BLOCK_ROTATION.length];

      setColor("fill", blockColor);
      doc.roundedRect(MARGIN_LEFT, currentY, CONTENT_WIDTH, visibleH, BLOCK_RADIUS, BLOCK_RADIUS, "F");

      const blockTop = currentY;
      currentY += BLOCK_PADDING;
      currentY = layoutTask(task, index, MARGIN_LEFT + BLOCK_PADDING, currentY, CONTENT_WIDTH - BLOCK_PADDING * 2, true);
      currentY = Math.max(currentY + BLOCK_PADDING - 3, blockTop + visibleH);
      currentY += 12; // {spacing.section}-inspired gap so the next block reads as deliberate
    });

    // ── AI Draft References (monochrome list, not a color block) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedDrafts: any[] = [];
    try {
      if (project.drafts) {
        parsedDrafts = typeof project.drafts === "string" ? JSON.parse(project.drafts) : project.drafts;
      }
    } catch {
      // ignore parsing error
    }

    if (Array.isArray(parsedDrafts) && parsedDrafts.length > 0) {
      doc.addPage();
      currentY = MARGIN_TOP;

      drawEyebrow(MARGIN_LEFT, currentY, "Appendix", COLORS.ink);
      currentY += 7;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      setColor("text", COLORS.ink);
      doc.text("Referensi Draft Breakdown 5 AI Model", MARGIN_LEFT, currentY);
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor("text", COLORS.ink);
      doc.text("Ringkasan hasil breakdown dari setiap model AI sebagai referensi pembanding.", MARGIN_LEFT, currentY);
      currentY += 9;

      parsedDrafts.forEach((draft, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasTasks = typeof draft === "object" && Array.isArray((draft as any)?.tasks);

        currentY = ensureSpace(currentY, 12, true);
        drawEyebrow(MARGIN_LEFT, currentY, `Model ${idx + 1} Draft`, COLORS.ink);
        currentY += 2;
        setColor("draw", COLORS.hairlineSoft);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_LEFT, currentY, PAGE_WIDTH - MARGIN_RIGHT, currentY);
        currentY += 6;

        if (hasTasks) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (draft as any).tasks.forEach((t: any, ti: number) => {
            currentY = ensureSpace(currentY, 5, true);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            setColor("text", COLORS.ink);
            const tLines: string[] = doc.splitTextToSize(
              `${ti + 1}. ${t.title || "Unnamed Task"}`,
              CONTENT_WIDTH - 4
            );
            tLines.forEach((line) => {
              currentY = ensureSpace(currentY, 4.6, true);
              doc.text(line, MARGIN_LEFT + 2, currentY);
              currentY += 4.6;
            });

            if (t.subTasks && t.subTasks.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const subItems = t.subTasks.map((st: any) => {
                const stElements = safeJson(st.elements);
                return stElements.length > 0 ? `${st.title} (UI: ${stElements.join(", ")})` : st.title;
              });
              currentY = renderBulletList(
                MARGIN_LEFT + 6,
                currentY,
                CONTENT_WIDTH - 6,
                subItems,
                { fontSize: 8.5, color: COLORS.ink, lineHeight: 4 },
                true
              );
            }
            currentY += 2;
          });
        } else {
          const rawText = typeof draft === "string" ? draft : JSON.stringify(draft, null, 2);
          currentY = renderParagraph(
            MARGIN_LEFT + 2,
            currentY,
            CONTENT_WIDTH - 4,
            rawText,
            { fontStyle: "italic", color: COLORS.ink, fontSize: 8.5 },
            true
          );
        }
        currentY += 8;
      });
    }

    // ── Diagrams ──
    const fetchMermaidImage = async (mermaidCode: string): Promise<string | null> => {
      if (!mermaidCode || mermaidCode.trim() === "") return null;
      try {
        const jsonStr = JSON.stringify({ code: mermaidCode, mermaid: '{\n  "theme": "default"\n}' });
        const base64 = Buffer.from(jsonStr).toString("base64");
        const res = await fetch(`https://mermaid.ink/img/${base64}`);
        if (!res.ok) return null;
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return `data:image/jpeg;base64,${buffer.toString("base64")}`;
      } catch (e) {
        console.error("Failed to fetch diagram", e);
        return null;
      }
    };

    const addDiagramToDoc = async (title: string, mermaidCode: string | undefined | null) => {
      if (!mermaidCode) return;
      const imgData = await fetchMermaidImage(mermaidCode);
      if (imgData) {
        doc.addPage();
        drawEyebrow(MARGIN_LEFT, 16, "Diagram", COLORS.ink);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        setColor("text", COLORS.ink);
        doc.text(title, MARGIN_LEFT, 24);
        setColor("draw", COLORS.hairlineSoft);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_LEFT, 27, PAGE_WIDTH - MARGIN_RIGHT, 27);

        try {
          const props = doc.getImageProperties(imgData);
          const maxWidth = CONTENT_WIDTH;
          const maxHeight = PAGE_HEIGHT - 48;

          let imgWidth = props.width;
          let imgHeight = props.height;

          if (imgWidth > maxWidth) {
            const ratio = maxWidth / imgWidth;
            imgWidth = maxWidth;
            imgHeight = imgHeight * ratio;
          }
          if (imgHeight > maxHeight) {
            const ratio = maxHeight / imgHeight;
            imgHeight = maxHeight;
            imgWidth = imgWidth * ratio;
          }

          const xOffset = MARGIN_LEFT + (maxWidth - imgWidth) / 2;
          setColor("fill", COLORS.surfaceSoft);
          doc.roundedRect(xOffset - 3, 34 - 3, imgWidth + 6, imgHeight + 6, SUB_RADIUS, SUB_RADIUS, "F");
          doc.addImage(imgData, "JPEG", xOffset, 34, imgWidth, imgHeight);
        } catch (e) {
          console.error("Failed to add image to PDF", e);
        }
      }
    };

    if (moduleDiagram?.mermaidSyntax) {
      await addDiagramToDoc("Diagram Arsitektur Modul", moduleDiagram.mermaidSyntax);
    }
    if (project.flowMermaid) {
      await addDiagramToDoc("User Flow Diagram", project.flowMermaid);
    }
    if (project.erdMermaid) {
      await addDiagramToDoc("Entity Relationship Diagram (ERD)", project.erdMermaid);
    }

    // ── Footer: monochrome, mirrors DESIGN.md footer/caption tokens ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      setColor("draw", COLORS.hairlineSoft);
      doc.setLineWidth(0.2);
      doc.line(MARGIN_LEFT, PAGE_HEIGHT - 13, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 13);

      drawEyebrow(MARGIN_LEFT, PAGE_HEIGHT - 8, "Laporan Proyek BRD", COLORS.ink);

      const pageLabel = `Halaman ${i} dari ${totalPages}`;
      doc.setFont("courier", "normal");
      doc.setFontSize(7.6);
      const pageLabelWidth = doc.getTextWidth(pageLabel.toUpperCase());
      setColor("text", COLORS.ink);
      doc.text(pageLabel.toUpperCase(), PAGE_WIDTH - MARGIN_RIGHT - pageLabelWidth, PAGE_HEIGHT - 8);
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${project.title.replace(/[^a-zA-Z0-9]/g, "_")}_laporan.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to export PDF:", error);
    return NextResponse.json({ error: "Failed to export PDF" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeJson(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}