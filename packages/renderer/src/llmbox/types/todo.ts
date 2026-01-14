export interface TodoItem {
  id: string;
  parentId?: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  updatedAt: number;
  children?: TodoItem[];
  level?: number;
}
