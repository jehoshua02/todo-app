export interface TaskList {
  id: string;
  name: string;
  isSystem: boolean;
  position: number;
  createdAt: string;
}

export async function fetchLists(): Promise<TaskList[]> {
  const res = await fetch('/api/tasks/lists', {
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch lists');
  }

  const data = await res.json();
  return data.lists;
}

export async function createList(name: string): Promise<TaskList> {
  const res = await fetch('/api/tasks/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to create list');
  }

  const data = await res.json();
  return data.list;
}

export async function renameList(id: string, name: string): Promise<TaskList> {
  const res = await fetch(`/api/tasks/lists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to rename list');
  }

  const data = await res.json();
  return data.list;
}

export async function reorderLists(listIds: string[]): Promise<TaskList[]> {
  const res = await fetch('/api/tasks/lists/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ listIds }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to reorder lists');
  }

  const data = await res.json();
  return data.lists;
}

export async function deleteList(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/lists/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete list');
  }
}

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

export async function fetchTasks(listId: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks/lists/${listId}/tasks`, {
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch tasks');
  }

  const data = await res.json();
  return data.tasks;
}

export async function createTask(listId: string, title: string): Promise<Task> {
  const res = await fetch(`/api/tasks/lists/${listId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to create task');
  }

  const data = await res.json();
  return data.task;
}

export async function updateTask(listId: string, taskId: string, fields: TaskUpdate): Promise<Task> {
  const res = await fetch(`/api/tasks/lists/${listId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(fields),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to update task');
  }

  const data = await res.json();
  return data.task;
}

export async function deleteTask(listId: string, taskId: string): Promise<void> {
  const res = await fetch(`/api/tasks/lists/${listId}/tasks/${taskId}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete task');
  }
}
