import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { logoutSession } from '../api/auth';

export default function Home() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.username}
        </h1>
        <p className="text-gray-600">Your tasks will appear here.</p>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
