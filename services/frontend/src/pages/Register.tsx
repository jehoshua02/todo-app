import { useState } from 'react';
import { registerWithPasskey } from '../api/auth';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Register() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setStatus('loading');
    setError('');

    try {
      await registerWithPasskey(username.trim());
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-green-700">Registration complete</h1>
          <p className="mt-2 text-gray-600">
            Welcome, <span className="font-medium">{username}</span>. Your passkey has been saved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username webauthn"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={status === 'loading'}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Enter a username"
          />
        </div>

        {status === 'error' && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {status === 'loading' ? 'Registering...' : 'Register with passkey'}
        </button>
      </form>
    </div>
  );
}
