import { Navigate, useLocation } from 'react-router-dom';

interface LocationState {
  username: string;
}

export default function Home() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.username) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {state.username}
        </h1>
        <p className="text-gray-600">Your tasks will appear here.</p>
      </div>
    </div>
  );
}
