import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth.context';
import { logoutSession } from '../auth/auth.api';
import { fetchLists, createList, renameList, deleteList, reorderLists } from './lists.api';
import type { TaskList } from './lists.types';

type LoadState = 'loading' | 'ready' | 'error';

export default function Lists() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    fetchLists()
      .then((data) => {
        setLists(data);
        setLoadState('ready');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load lists');
        setLoadState('error');
      });
  }, [user]);

  useEffect(() => {
    if (isCreating) inputRef.current?.focus();
  }, [isCreating]);

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

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

  async function handleLogout() {
    await logoutSession();
    logout();
  }

  function handleNewListClick() {
    setIsCreating(true);
    setNewName('');
    setCreateError('');
  }

  function handleCancelCreate() {
    setIsCreating(false);
    setNewName('');
    setCreateError('');
  }

  async function handleSaveList() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setIsSaving(true);
    setCreateError('');
    try {
      const list = await createList(trimmed);
      setLists((prev) => [...prev, list]);
      setIsCreating(false);
      setNewName('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create list');
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSaveList();
    if (e.key === 'Escape') handleCancelCreate();
  }

  function startRename(list: TaskList) {
    if (list.isSystem) return;
    setRenamingId(list.id);
    setRenameValue(list.name);
    setRenameError('');
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue('');
    setRenameError('');
  }

  async function saveRename() {
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;

    const current = lists.find((l) => l.id === renamingId);
    if (current && current.name === trimmed) {
      cancelRename();
      return;
    }

    setIsRenaming(true);
    setRenameError('');
    try {
      const updated = await renameList(renamingId, trimmed);
      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setRenamingId(null);
      setRenameValue('');
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Failed to rename list');
    } finally {
      setIsRenaming(false);
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') cancelRename();
  }

  async function moveList(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lists.length) return;

    const reordered = [...lists];
    const moved = reordered.splice(index, 1)[0];
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);
    setLists(reordered);

    setIsReordering(true);
    try {
      const updated = await reorderLists(reordered.map((l) => l.id));
      setLists(updated);
    } catch {
      const refreshed = await fetchLists();
      setLists(refreshed);
    } finally {
      setIsReordering(false);
    }
  }

  function confirmDelete(listId: string) {
    setConfirmingDeleteId(listId);
    setDeleteError('');
  }

  function cancelDelete() {
    setConfirmingDeleteId(null);
    setDeleteError('');
  }

  async function handleDelete() {
    if (!confirmingDeleteId) return;

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteList(confirmingDeleteId);
      setLists((prev) => prev.filter((l) => l.id !== confirmingDeleteId));
      setConfirmingDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete list');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Lists</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-900 py-1 px-2 -mr-2"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-lg mx-auto">
        {loadState === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-500">Loading lists...</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="px-4 py-8 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loadState === 'ready' && (
          <>
            <ul className="divide-y divide-gray-200 bg-white mt-2 rounded-lg mx-4 shadow-sm border border-gray-200">
              {lists.map((list, index) => (
                <li key={list.id}>
                  {renamingId === list.id ? (
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={handleRenameKeyDown}
                          onBlur={saveRename}
                          maxLength={100}
                          disabled={isRenaming}
                          aria-label="Rename list"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        />
                      </div>
                      {renameError && (
                        <p className="text-red-600 text-xs mt-1" role="alert">{renameError}</p>
                      )}
                    </div>
                  ) : confirmingDeleteId === list.id ? (
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <span className="text-gray-900 text-sm">Delete &ldquo;{list.name}&rdquo;?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          aria-label="Confirm delete"
                          className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 active:bg-red-800 disabled:opacity-50 transition-colors"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={cancelDelete}
                          disabled={isDeleting}
                          className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-700 active:text-gray-900 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      {deleteError && (
                        <p className="text-red-600 text-xs mt-1" role="alert">{deleteError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex flex-col px-1">
                        <button
                          onClick={() => moveList(index, -1)}
                          disabled={index === 0 || isReordering}
                          aria-label={`Move ${list.name} up`}
                          className="p-1 text-gray-400 hover:text-gray-600 active:text-gray-800 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveList(index, 1)}
                          disabled={index === lists.length - 1 || isReordering}
                          aria-label={`Move ${list.name} down`}
                          className="p-1 text-gray-400 hover:text-gray-600 active:text-gray-800 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                      <button
                        className="flex-1 flex items-center justify-between px-2 py-3 min-h-[44px] text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        onClick={() => navigate(`/lists/${list.id}`)}
                      >
                        <span className="text-gray-900 font-medium">
                          {list.name}
                        </span>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                      {!list.isSystem && (
                        <>
                          <button
                            onClick={() => startRename(list)}
                            aria-label={`Rename ${list.name}`}
                            className="px-2 py-3 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDelete(list.id)}
                            aria-label={`Delete ${list.name}`}
                            className="px-2 py-3 text-gray-400 hover:text-red-500 active:text-red-700 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ))}

              {isCreating && (
                <li className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="List name"
                      maxLength={100}
                      disabled={isSaving}
                      aria-label="New list name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSaveList}
                      disabled={isSaving || !newName.trim()}
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
                </li>
              )}
            </ul>

            {!isCreating && (
              <div className="mx-4 mt-3">
                <button
                  onClick={handleNewListClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-blue-600 font-medium text-sm bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New List
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
