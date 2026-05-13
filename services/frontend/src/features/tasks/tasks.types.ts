export interface Task {
  id: string;
  listId: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  completed?: boolean;
}
