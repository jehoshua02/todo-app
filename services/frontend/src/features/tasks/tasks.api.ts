import type { Task, TaskUpdate } from './tasks.types';

export async function fetchTask(listId: string, taskId: string): Promise<Task> {
  const res = await fetch(`/api/tasks/lists/${listId}/tasks/${taskId}`, {
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch task');
  }

  const data = await res.json();
  return data.task;
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

export async function reorderTasks(listId: string, taskIds: string[]): Promise<Task[]> {
  const res = await fetch(`/api/tasks/lists/${listId}/tasks/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ taskIds }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to reorder tasks');
  }

  const data = await res.json();
  return data.tasks;
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
