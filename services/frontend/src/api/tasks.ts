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
