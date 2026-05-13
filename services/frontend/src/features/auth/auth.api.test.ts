import { refreshSession, logoutSession } from './auth.api';

describe('refreshSession', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns user data when refresh succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ userId: 'u1', username: 'alice' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await refreshSession();

    expect(result).toEqual({ userId: 'u1', username: 'alice' });
    expect(fetch).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
    });
  });

  it('returns null when refresh returns 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid refresh token' }), {
        status: 401,
      }),
    );

    const result = await refreshSession();

    expect(result).toBeNull();
  });
});

describe('logoutSession', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the logout endpoint with POST', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await logoutSession();

    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  });
});
