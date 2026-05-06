import { describe, it, expect, vi } from 'vitest';
import { setTokenCookies } from './cookies';

function createMockResponse() {
  const cookies: Array<{ name: string; value: string; options: any }> = [];
  return {
    cookie: vi.fn((name: string, value: string, options: any) => {
      cookies.push({ name, value, options });
    }),
    cookies,
  };
}

describe('setTokenCookies', () => {
  it('sets access_token cookie with correct options', () => {
    const res = createMockResponse();
    setTokenCookies(res as any, 'access-jwt', 'refresh-hex');

    const accessCookie = res.cookies.find((c) => c.name === 'access_token');
    expect(accessCookie).toBeDefined();
    expect(accessCookie!.value).toBe('access-jwt');
    expect(accessCookie!.options.httpOnly).toBe(true);
    expect(accessCookie!.options.sameSite).toBe('strict');
    expect(accessCookie!.options.path).toBe('/');
    expect(accessCookie!.options.maxAge).toBe(15 * 60 * 1000);
  });

  it('sets refresh_token cookie scoped to /api/auth/refresh', () => {
    const res = createMockResponse();
    setTokenCookies(res as any, 'access-jwt', 'refresh-hex');

    const refreshCookie = res.cookies.find((c) => c.name === 'refresh_token');
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie!.value).toBe('refresh-hex');
    expect(refreshCookie!.options.httpOnly).toBe(true);
    expect(refreshCookie!.options.path).toBe('/api/auth/refresh');
    expect(refreshCookie!.options.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('sets secure flag in production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = createMockResponse();
    setTokenCookies(res as any, 'a', 'b');
    expect(res.cookies[0].options.secure).toBe(true);
    process.env.NODE_ENV = original;
  });
});
