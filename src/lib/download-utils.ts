import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Download diagram SVG langsung sebagai file .svg
 * Mermaid text ada di <foreignObject> — canvas TIDAK bisa render foreignObject,
 * jadi PNG via canvas akan kehilangan teks. SVG adalah format yang tepat.
 */
export function downloadSvgAsPng(
  svgElement: SVGElement,
  filename: string = "diagram.svg"
): Promise<void> {
  return new Promise((resolve, reject) => {
    const clone = svgElement.cloneNode(true) as SVGElement;

    // Hapus <image> eksternal yang bisa CORS block
    clone.querySelectorAll("image").forEach((img) => {
      const href = img.getAttribute("href") || img.getAttribute("xlink:href");
      if (href && !href.startsWith("data:")) {
        img.remove();
      }
    });

    // Kumpulkan style agar tampilan tetap terjaga
    const styleContainer = document.createElement("style");
    document.querySelectorAll("style").forEach((style) => {
      styleContainer.textContent += style.textContent;
    });
    // Tambahkan CSS untuk fallback font
    styleContainer.textContent += `
      .mermaid-wrapper * { font-family: system-ui, -apple-system, sans-serif !important; }
    `;
    clone.insertBefore(styleContainer, clone.firstChild);

    // Set explicit white background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", "#ffffff");
    clone.insertBefore(rect, clone.firstChild);

    // Serialize & download
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const finalName = filename.endsWith(".png")
      ? filename.replace(".png", ".svg")
      : filename;

    const a = document.createElement("a");
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    resolve();
  });
}

/**
 * Download a DOM element as PNG using html-to-image
 */
export async function downloadDomAsPng(element: HTMLElement, filename: string = "diagram.png") {
  try {
    const dataUrl = await toPng(element, { backgroundColor: '#ffffff', pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("Failed to download PNG:", err);
  }
}

/**
 * Download a DOM element as PDF using html-to-image and jsPDF
 */
export async function downloadDomAsPdf(element: HTMLElement, filename: string = "diagram.pdf") {
  try {
    const dataUrl = await toPng(element, { backgroundColor: '#ffffff', pixelRatio: 2 });
    
    // Create an image object to get the dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    // Calculate dimensions for A4 or custom size
    // Default PDF units are 'mm'. We'll use a landscape custom size if the image is wide,
    // or standard A4 if it fits nicely. For simplicity, we'll make the PDF exactly the image dimensions in pts.
    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width, img.height]
    });
    
    pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
    pdf.save(filename);
  } catch (err) {
    console.error("Failed to download PDF:", err);
  }
}

/**
 * Triggers download of a file from a URL.
 */
export function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
