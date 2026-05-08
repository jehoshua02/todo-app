import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchTasks, createTask, updateTask, deleteTask, type Task, type TaskUpdate } from '../api/tasks';

type LoadState = 'loading' | 'ready' | 'error';

export default function ListDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editError, setEditError] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !listId) return;

    fetchTasks(listId)
      .then((data) => {
        setTasks(data);
        setLoadState('ready');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setLoadState('error');
      });
  }, [user, listId]);

  useEffect(() => {
    if (isCreating) inputRef.current?.focus();
  }, [isCreating]);

  useEffect(() => {
    if (editingTaskId) editTitleRef.current?.focus();
  }, [editingTaskId]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleNewTaskClick() {
    setIsCreating(true);
    setNewTitle('');
    setCreateError('');
    setEditingTaskId(null);
  }

  function handleCancelCreate() {
    setIsCreating(false);
    setNewTitle('');
    setCreateError('');
  }

  async function handleSaveTask() {
    const trimmed = newTitle.trim();
    if (!trimmed || !listId) return;

    setIsSaving(true);
    setCreateError('');
    try {
      const task = await createTask(listId, trimmed);
      setTasks((prev) => [...prev, task]);
      setIsCreating(false);
      setNewTitle('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleComplete(task: Task) {
    if (!listId) return;
    try {
      const updated = await updateTask(listId, task.id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      // Silently fail — task stays in current state
    }
  }

  function handleEditClick(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setEditError('');
    setIsCreating(false);
  }

  function handleCancelEdit() {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
    setEditDueDate('');
    setEditError('');
  }

  async function handleSaveEdit() {
    if (!listId || !editingTaskId) return;

    const task = tasks.find((t) => t.id === editingTaskId);
    if (!task) return;

    const fields: TaskUpdate = {};
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setEditError('Title is required');
      return;
    }
    if (trimmedTitle !== task.title) fields.title = trimmedTitle;

    const trimmedDesc = editDescription.trim();
    const currentDesc = task.description ?? '';
    if (trimmedDesc !== currentDesc) {
      fields.description = trimmedDesc || null;
    }

    const currentDue = task.dueDate ? task.dueDate.slice(0, 10) : '';
    if (editDueDate !== currentDue) {
      fields.dueDate = editDueDate || null;
    }

    if (Object.keys(fields).length === 0) {
      handleCancelEdit();
      return;
    }

    setIsEditSaving(true);
    setEditError('');
    try {
      const updated = await updateTask(listId, editingTaskId, fields);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTaskId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsEditSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!listId || !deletingTaskId) return;
    try {
      await deleteTask(listId, deletingTaskId);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId));
      setDeletingTaskId(null);
      setEditingTaskId(null);
    } catch {
      // Silently fail — task stays in current state
    }
  }

  const activeTasks = tasks.filter((t) => !t.completed);

  function handleCreateKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSaveTask();
    if (e.key === 'Escape') handleCancelCreate();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors"
          aria-label="Back to lists"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Tasks</h1>
      </header>

      <div className="max-w-lg mx-auto">
        {loadState === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="px-4 py-8 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loadState === 'ready' && (
          <>
            {activeTasks.length === 0 && !isCreating && (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 text-sm">No tasks yet</p>
              </div>
            )}

            {activeTasks.length > 0 && (
              <ul className="divide-y divide-gray-200 bg-white mt-2 rounded-lg mx-4 shadow-sm border border-gray-200">
                {activeTasks.map((task) => (
                  <li key={task.id}>
                    {editingTaskId === task.id ? (
                      <div className="px-4 py-3 space-y-2">
                        <input
                          ref={editTitleRef}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Task title"
                          maxLength={500}
                          disabled={isEditSaving}
                          aria-label="Edit task title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description (optional)"
                          maxLength={2000}
                          rows={3}
                          disabled={isEditSaving}
                          aria-label="Edit task description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-none"
                        />
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          disabled={isEditSaving}
                          aria-label="Edit task due date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        />
                        <div className="flex items-center gap-2">
                          {deletingTaskId === task.id ? (
                            <>
                              <span className="text-sm text-gray-700">Delete this task?</span>
                              <button
                                onClick={handleConfirmDelete}
                                aria-label="Confirm delete"
                                className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 active:bg-red-800 transition-colors"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeletingTaskId(null)}
                                className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700 active:text-gray-900 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                disabled={isEditSaving || !editTitle.trim()}
                                className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isEditSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isEditSaving}
                                className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700 active:text-gray-900 disabled:opacity-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <div className="flex-1" />
                              <button
                                onClick={() => setDeletingTaskId(task.id)}
                                disabled={isEditSaving}
                                aria-label={`Delete ${task.title}`}
                                className="p-2 text-gray-400 hover:text-red-600 active:text-red-700 disabled:opacity-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        {editError && (
                          <p className="text-red-600 text-xs" role="alert">{editError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 flex items-center gap-3 min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggleComplete(task)}
                          aria-label={`Complete ${task.title}`}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                        />
                        <button
                          onClick={() => handleEditClick(task)}
                          className="flex-1 text-left min-w-0"
                          aria-label={`Edit ${task.title}`}
                        >
                          <span className="text-gray-900 block truncate">{task.title}</span>
                          {task.dueDate && (
                            <span className="text-gray-500 text-xs block mt-0.5">
                              Due {task.dueDate.slice(0, 10)}
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {isCreating && (
              <div className="mx-4 mt-2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleCreateKeyDown}
                    placeholder="Task title"
                    maxLength={500}
                    disabled={isSaving}
                    aria-label="New task title"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSaveTask}
                    disabled={isSaving || !newTitle.trim()}
                    className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelCreate}
                    disabled={isSaving}
                    className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700 active:text-gray-900 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {createError && (
                  <p className="text-red-600 text-xs mt-1" role="alert">{createError}</p>
                )}
              </div>
            )}

            {!isCreating && (
              <div className="mx-4 mt-3">
                <button
                  onClick={handleNewTaskClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-blue-600 font-medium text-sm bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Task
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
