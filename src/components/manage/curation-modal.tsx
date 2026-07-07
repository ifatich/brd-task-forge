"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface CurationModalProps {
  projectId: string;
  drafts: any[];
  currentTasks: any[]; // Used to check by default
  onClose: () => void;
  onSaved: () => void;
}

export function CurationModal({ projectId, drafts, currentTasks, onClose, onSaved }: CurationModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract all unique tasks and subtasks
  const uniqueTasks = useMemo(() => {
    const taskMap = new Map<string, any>();
    
    drafts.forEach(draft => {
      if (draft && Array.isArray(draft.tasks)) {
        draft.tasks.forEach((t: any) => {
          const key = (t.title || "").toLowerCase().trim();
          if (!key) return;

          if (!taskMap.has(key)) {
            // Clone the task so we don't mutate the original draft
            taskMap.set(key, { ...t, subTasksMap: new Map<string, any>() });
          }

          const existingTask = taskMap.get(key);
          if (t.subTasks && Array.isArray(t.subTasks)) {
            t.subTasks.forEach((st: any) => {
              const stKey = (st.title || "").toLowerCase().trim();
              if (stKey && !existingTask.subTasksMap.has(stKey)) {
                existingTask.subTasksMap.set(stKey, st);
              }
            });
          }
        });
      }
    });

    // Convert map back to array and build subTasks array
    return Array.from(taskMap.values()).map(t => ({
      ...t,
      subTasks: Array.from(t.subTasksMap.values())
    }));
  }, [drafts]);

  // Track selected tasks and subtasks
  // We use object paths like `taskTitle` or `taskTitle::subTaskTitle`
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    
    const currentTaskTitles = new Set(currentTasks.map(t => (t.title || "").toLowerCase().trim()));
    const currentSubTaskTitles = new Set();
    currentTasks.forEach(t => {
      if (t.subTasks) {
        t.subTasks.forEach((st: any) => {
          currentSubTaskTitles.add((st.title || "").toLowerCase().trim());
        });
      }
    });

    uniqueTasks.forEach(t => {
      const tKey = (t.title || "").toLowerCase().trim();
      if (currentTaskTitles.has(tKey)) {
        initial.add(tKey);
      }
      t.subTasks.forEach((st: any) => {
        const stKey = (st.title || "").toLowerCase().trim();
        // If task is selected, maybe subtasks are selected too? 
        // We'll trust the currentSubTaskTitles
        if (currentTaskTitles.has(tKey) || currentSubTaskTitles.has(stKey)) {
           initial.add(`${tKey}::${stKey}`);
        }
      });
    });

    return initial;
  });

  const toggleTask = (taskTitle: string) => {
    const key = taskTitle.toLowerCase().trim();
    const newSelected = new Set(selected);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
      // Optional: unselect all subtasks if task is unselected
      uniqueTasks.find(t => (t.title || "").toLowerCase().trim() === key)?.subTasks.forEach((st: any) => {
        newSelected.delete(`${key}::${(st.title || "").toLowerCase().trim()}`);
      });
    } else {
      newSelected.add(key);
      // Select all subtasks by default
      uniqueTasks.find(t => (t.title || "").toLowerCase().trim() === key)?.subTasks.forEach((st: any) => {
        newSelected.add(`${key}::${(st.title || "").toLowerCase().trim()}`);
      });
    }
    
    setSelected(newSelected);
  };

  const toggleSubTask = (taskTitle: string, subTaskTitle: string) => {
    const tKey = taskTitle.toLowerCase().trim();
    const stKey = subTaskTitle.toLowerCase().trim();
    const key = `${tKey}::${stKey}`;
    
    const newSelected = new Set(selected);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
      // Auto-select parent task if a subtask is selected
      newSelected.add(tKey);
    }
    
    setSelected(newSelected);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Build final tasks array
      const finalTasks: any[] = [];
      
      uniqueTasks.forEach(t => {
        const tKey = (t.title || "").toLowerCase().trim();
        if (selected.has(tKey)) {
          const finalSubTasks: any[] = [];
          t.subTasks.forEach((st: any) => {
            const stKey = (st.title || "").toLowerCase().trim();
            if (selected.has(`${tKey}::${stKey}`)) {
              finalSubTasks.push(st);
            }
          });
          finalTasks.push({ ...t, subTasks: finalSubTasks });
        }
      });

      const res = await fetch(`/api/projects/${projectId}/curate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: finalTasks }),
      });

      if (!res.ok) {
        throw new Error("Failed to save curation results");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <DialogTitle>Curate Task List</DialogTitle>
          <DialogDescription>
            Determine which specifications to keep. This list is a complete combination of all tasks proposed by all 5 AI models.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {uniqueTasks.map((t, i) => {
              const tKey = (t.title || "").toLowerCase().trim();
              const isSelected = selected.has(tKey);
              
              return (
                <div key={i} className={`p-4 rounded-xl border ${isSelected ? 'border-blue-300 dark:border-blue-800 bg-white dark:bg-zinc-900 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 opacity-60 hover:opacity-100'} transition-all`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="pt-0.5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={() => toggleTask(t.title)}
                      />
                    </div>
                    <div>
                      <div className={`font-semibold ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 line-through'}`}>{t.title}</div>
                      {t.description && (
                        <p className={`text-sm mt-1 ${isSelected ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500 line-through'}`}>{t.description}</p>
                      )}
                    </div>
                  </label>
                  
                  {t.subTasks && t.subTasks.length > 0 && (
                    <div className="mt-3 ml-7 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4 space-y-2">
                      {t.subTasks.map((st: any, j: number) => {
                        const stKey = (st.title || "").toLowerCase().trim();
                        const isStSelected = selected.has(`${tKey}::${stKey}`);
                        
                        return (
                          <label key={j} className="flex items-start gap-3 cursor-pointer group">
                            <div className="pt-0.5">
                              <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                checked={isStSelected}
                                onChange={() => toggleSubTask(t.title, st.title)}
                              />
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm ${isStSelected ? 'text-zinc-800 dark:text-zinc-200 font-medium' : 'text-zinc-500 dark:text-zinc-400 line-through'}`}>{st.title}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Curation Results"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
