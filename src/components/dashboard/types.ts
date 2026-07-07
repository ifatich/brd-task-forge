export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  taskSummary: { total: number; done: number; inProgress: number; todo: number };
  createdAt: string;
  updatedAt: string;
  fileUrl?: string;
}
