import { ProcessingStage } from "@/components/upload/ai-processing-indicator";

interface UploadState {
  isProcessing: boolean;
  currentStage: ProcessingStage | null;
  previewData: any | null;
  fileName: string | null;
  error: string | null;
}

type Listener = (state: UploadState) => void;

class UploadStore {
  private state: UploadState = {
    isProcessing: false,
    currentStage: null,
    previewData: null,
    fileName: null,
    error: null,
  };
  private listeners: Set<Listener> = new Set();
  
  // Fake timers for UI progress
  private timers: NodeJS.Timeout[] = [];

  getState() {
    return this.state;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private setState(updates: Partial<UploadState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }
  
  clear() {
    this.setState({
      isProcessing: false,
      currentStage: null,
      previewData: null,
      fileName: null,
      error: null,
    });
  }

  async startAnalysis(file: File) {
    if (this.state.isProcessing) return;
    
    // Reset state before starting
    this.setState({
      isProcessing: true,
      currentStage: "extracting",
      previewData: null,
      fileName: file.name,
      error: null,
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Progress stages during fetch — AI takes 8-10 minutes, so we space out the stages.
      // We don't advance to "done" until the actual fetch resolves.
      const stageTimers = [
        { after: 15000, stage: "analyzing" as ProcessingStage },
        { after: 300000, stage: "verifying" as ProcessingStage },
        { after: 420000, stage: "diagramming" as ProcessingStage },
      ];
      
      this.timers.forEach(clearTimeout);
      this.timers = stageTimers.map(({ after, stage }) =>
        setTimeout(() => {
          if (this.state.isProcessing) {
             this.setState({ currentStage: stage });
          }
        }, after)
      );

      const res = await fetch("/api/pipeline?preview=true", {
        method: "POST",
        body: formData,
      });

      this.timers.forEach(clearTimeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        this.setState({
          isProcessing: false,
          currentStage: "error",
          error: errData.error || "Gagal memproses dokumen. Pastikan API key terkonfigurasi dan valid."
        });
        return;
      }

      // Brief cosmetic stage after completion before showing results
      this.setState({ currentStage: "done" });
      await new Promise((r) => setTimeout(r, 500));

      const data = await res.json();
      this.setState({
        isProcessing: false,
        previewData: data,
      });
      
    } catch (err: any) {
      this.timers.forEach(clearTimeout);
      this.setState({
        isProcessing: false,
        currentStage: "error",
        error: err.message || "Terjadi kesalahan saat memproses dokumen.",
      });
    }
  }
}

export const uploadStore = new UploadStore();
