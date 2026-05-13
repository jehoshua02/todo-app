import type { TaskList } from './lists.types';

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
