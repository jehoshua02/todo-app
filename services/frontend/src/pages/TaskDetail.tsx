import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchTask, updateTask, deleteTask, type Task, type TaskUpdate } from '../api/tasks';

type LoadState = 'loading' | 'ready' | 'error';

export default function TaskDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const { listId, taskId } = useParams<{ listId: string; taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editError, setEditError] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !listId || !taskId) return;

    fetchTask(listId, taskId)
      .then((data) => {
        setTask(data);
        setLoadState('ready');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load task');
        setLoadState('error');
      });
  }, [user, listId, taskId]);

  useEffect(() => {
    if (isEditing) editTitleRef.current?.focus();
  }, [isEditing]);

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

  function handleEditClick() {
    if (!task) return;
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setEditError('');
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditTitle('');
    setEditDescription('');
    setEditDueDate('');
    setEditError('');
  }

  async function handleSaveEdit() {
    if (!listId || !taskId || !task) return;

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
      const updated = await updateTask(listId, taskId, fields);
      setTask(updated);
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsEditSaving(false);
    }
  }

  async function handleToggleComplete() {
    if (!listId || !taskId || !task) return;
    try {
      const updated = await updateTask(listId, taskId, { completed: !task.completed });
      setTask(updated);
    } catch {
      // Silently fail
    }
  }

  async function handleConfirmDelete() {
    if (!listId || !taskId) return;
    try {
      await deleteTask(listId, taskId);
      navigate(`/lists/${listId}`);
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(`/lists/${listId}`)}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors"
          aria-label="Back to tasks"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Task Detail</h1>
      </header>

      <div className="max-w-lg mx-auto">
        {loadState === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-500">Loading task...</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="px-4 py-8 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loadState === 'ready' && task && (
          <>
            {isEditing ? (
              <div className="mx-4 mt-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-4 space-y-3">
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
                  rows={4}
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
                </div>
                {editError && (
                  <p className="text-red-600 text-xs" role="alert">{editError}</p>
                )}
              </div>
            ) : (
              <div className="mx-4 mt-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={handleToggleComplete}
                      aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h2
                        className={`text-base font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                        data-testid="task-title"
                      >
                        {task.title}
                      </h2>
                    </div>
                  </div>

                  {task.description && (
                    <div className="mt-3 pl-8">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap" data-testid="task-description">
                        {task.description}
                      </p>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="mt-3 pl-8">
                      <span className="text-xs text-gray-500" data-testid="task-due-date">
                        Due {task.dueDate.slice(0, 10)}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 pl-8 flex items-center gap-2">
                    <button
                      onClick={handleEditClick}
                      aria-label="Edit task"
                      className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 active:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    {isDeleting ? (
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
                          onClick={() => setIsDeleting(false)}
                          className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700 active:text-gray-900 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsDeleting(true)}
                        aria-label={`Delete ${task.title}`}
                        className="p-2 text-gray-400 hover:text-red-600 active:text-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
