import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { logoutSession } from '../api/auth';
import { fetchLists, createList, renameList, type TaskList } from '../api/tasks';

type LoadState = 'loading' | 'ready' | 'error';

export default function Lists() {
  const { user, isLoading: authLoading, logout } = useAuth();
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
              {lists.map((list) => (
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
                  ) : (
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      onClick={() => startRename(list)}
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
