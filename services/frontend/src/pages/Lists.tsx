import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { logoutSession } from '../api/auth';
import { fetchLists, type TaskList } from '../api/tasks';

type LoadState = 'loading' | 'ready' | 'error';

export default function Lists() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState('');

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
          <ul className="divide-y divide-gray-200 bg-white mt-2 rounded-lg mx-4 shadow-sm border border-gray-200">
            {lists.map((list) => (
              <li key={list.id}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
