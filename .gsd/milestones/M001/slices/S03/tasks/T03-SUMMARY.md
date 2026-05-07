---
id: T03
parent: S03
milestone: M001
key_files:
  - services/frontend/src/pages/Home.tsx
  - services/frontend/src/pages/Login.tsx
  - services/frontend/src/pages/Register.tsx
  - services/frontend/src/App.tsx
  - services/auth/src/logout.ts
  - services/auth/src/logout.test.ts
  - services/auth/src/app.ts
  - services/auth/src/cookies.ts
  - services/auth/src/cookies.test.ts
key_decisions:
  - Widened refresh_token cookie path to /api/auth/ so logout endpoint can receive and revoke the token
  - Logout endpoint clears cookies and revokes token if present — gracefully handles missing token
  - Login and Register pages redirect to Home when already authenticated
duration: 
verification_result: passed
completed_at: 2026-05-07T07:32:56.646Z
blocker_discovered: false
---

# T03: Wired auth context into all pages, added logout endpoint, replaced location.state with persistent auth

**Wired auth context into all pages, added logout endpoint, replaced location.state with persistent auth**

## What Happened

Replaced ephemeral location.state auth with the AuthContext provider across all pages. Home.tsx now reads user from useAuth(), shows a loading state during refresh-on-mount, redirects to /login when unauthenticated, and includes a Sign Out button. Login.tsx and Register.tsx call context login() on success and redirect already-authenticated users to Home. Built POST /api/auth/logout backend endpoint that revokes the refresh token and clears cookies. Widened refresh_token cookie path from /api/auth/refresh to /api/auth/ so the logout endpoint can receive and revoke the token. Added clearTokenCookies() to cookies.ts. All existing tests updated and passing.

## Verification

44 tests pass (37 backend + 7 frontend). TypeScript compiles clean on both services. Docker containers rebuilt with new code. Backend endpoints verified via curl: /api/auth/refresh returns 401 without cookie, /api/auth/logout returns 204. Frontend bundle verified to contain refresh, logout, and Sign Out UI. WebAuthn ceremony requires manual browser verification with platform authenticator.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `cd services/auth && npx vitest run` | 0 | pass | 944ms |
| 2 | `cd services/frontend && npx vitest run` | 0 | pass | 1730ms |
| 3 | `cd services/frontend && npx tsc -b --noEmit` | 0 | pass | 2000ms |
| 4 | `curl -s http://localhost:8080/api/auth/refresh -X POST` | 0 | pass | 100ms |
| 5 | `curl -s http://localhost:8080/api/auth/logout -X POST` | 0 | pass | 100ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `services/frontend/src/pages/Home.tsx`
- `services/frontend/src/pages/Login.tsx`
- `services/frontend/src/pages/Register.tsx`
- `services/frontend/src/App.tsx`
- `services/auth/src/logout.ts`
- `services/auth/src/logout.test.ts`
- `services/auth/src/app.ts`
- `services/auth/src/cookies.ts`
- `services/auth/src/cookies.test.ts`
