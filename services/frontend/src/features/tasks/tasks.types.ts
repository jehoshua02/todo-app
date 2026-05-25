export interface Task {
  id: string;
  listId: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  timeEstimate: number | null;
  urgency: number | null;
  importance: number | null;
  position: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  completed?: boolean;
  timeEstimate?: number | null;
  urgency?: number | null;
  importance?: number | null;
}
