---
id: S03
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - services/frontend/src/auth/AuthContext.tsx
  - services/frontend/src/api/auth.ts
  - services/frontend/src/pages/Home.tsx
  - services/frontend/src/pages/Login.tsx
  - services/frontend/src/pages/Register.tsx
  - services/frontend/src/App.tsx
  - services/auth/src/logout.ts
  - services/auth/src/cookies.ts
  - services/auth/src/app.ts
key_decisions:
  - React Context for auth state — no external state library needed at this scale
  - Refresh-on-mount pattern for session recovery — HttpOnly cookies handled automatically by browser
  - Cookie path widened to /api/auth/ to support both refresh and logout endpoints
  - vitest + @testing-library/react for frontend testing infrastructure
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-07T07:33:25.692Z
blocker_discovered: false
---

# S03: Stay logged in — persistent auth with token refresh

**Persistent auth via refresh-on-mount, React auth context, logout endpoint, and rewired pages**

## What Happened

S03 delivers persistent authentication across page refreshes and tab reopens. The backend refresh endpoint (built during S02) performs token rotation with revocation. A new React AuthContext calls /api/auth/refresh on mount — if cookies are valid, the user session is restored; otherwise the app redirects to login. All pages now use useAuth() instead of ephemeral location.state. A new POST /api/auth/logout endpoint revokes the refresh token and clears cookies. The refresh_token cookie path was widened from /api/auth/refresh to /api/auth/ to support both refresh and logout endpoints. Frontend test infrastructure (vitest + testing-library) was set up, with 7 tests covering the auth API functions and AuthContext behavior.

## Verification

44 tests pass across both services (37 backend, 7 frontend). TypeScript compiles clean. Docker containers rebuilt and running. Backend endpoints verified via curl. Frontend bundle confirmed to contain auth context code. WebAuthn full-flow requires manual verification with a platform authenticator.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

The app now handles auth persistence. Next natural slices: task CRUD (the core todo functionality), or token refresh interceptor for automatic retry on 401 during API calls.

## Files Created/Modified

- `services/frontend/src/auth/AuthContext.tsx` — New: Auth context provider with refresh-on-mount
- `services/frontend/src/api/auth.ts` — Added refreshSession() and logoutSession()
- `services/frontend/src/api/auth.test.ts` — New: Tests for refreshSession and logoutSession
- `services/frontend/src/auth/AuthContext.test.tsx` — New: Tests for AuthProvider behavior
- `services/frontend/src/pages/Home.tsx` — Rewired to useAuth(), added logout button
- `services/frontend/src/pages/Login.tsx` — Rewired to useAuth(), redirects if authenticated
- `services/frontend/src/pages/Register.tsx` — Rewired to useAuth(), redirects if authenticated
- `services/frontend/src/App.tsx` — Wrapped routes in AuthProvider
- `services/auth/src/logout.ts` — New: Logout endpoint with token revocation
- `services/auth/src/logout.test.ts` — New: Logout endpoint tests
- `services/auth/src/cookies.ts` — Added clearTokenCookies(), widened cookie path
- `services/auth/src/cookies.test.ts` — Updated for path change, added clearTokenCookies tests
- `services/auth/src/app.ts` — Registered logout route
- `services/frontend/vite.config.ts` — Added vitest config
- `services/frontend/tsconfig.json` — Added vitest globals types
- `services/frontend/package.json` — Added test deps and scripts
- `services/frontend/src/test-setup.ts` — New: Test setup for jest-dom matchers
