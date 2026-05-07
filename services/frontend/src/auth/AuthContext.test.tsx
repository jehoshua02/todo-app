import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authApi from '../api/auth';

function AuthConsumer() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>loading</div>;
  if (!user) return <div>logged-out</div>;
  return <div>hello {user.username}</div>;
}

let capturedAuth: ReturnType<typeof useAuth>;
function AuthCapture() {
  capturedAuth = useAuth();
  return null;
}

describe('AuthProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows user when refresh succeeds', async () => {
    vi.spyOn(authApi, 'refreshSession').mockResolvedValue({
      userId: 'u1',
      username: 'alice',
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('hello alice')).toBeInTheDocument();
    });
  });

  it('login() updates user state', async () => {
    vi.spyOn(authApi, 'refreshSession').mockResolvedValue(null);

    render(
      <AuthProvider>
        <AuthCapture />
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('logged-out')).toBeInTheDocument();
    });

    act(() => {
      capturedAuth.login({ userId: 'u2', username: 'bob' });
    });

    expect(screen.getByText('hello bob')).toBeInTheDocument();
  });

  it('logout() clears user state', async () => {
    vi.spyOn(authApi, 'refreshSession').mockResolvedValue({
      userId: 'u1',
      username: 'alice',
    });

    render(
      <AuthProvider>
        <AuthCapture />
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('hello alice')).toBeInTheDocument();
    });

    act(() => {
      capturedAuth.logout();
    });

    expect(screen.getByText('logged-out')).toBeInTheDocument();
  });

  it('shows logged-out when refresh fails', async () => {
    vi.spyOn(authApi, 'refreshSession').mockResolvedValue(null);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('logged-out')).toBeInTheDocument();
    });
  });
});
