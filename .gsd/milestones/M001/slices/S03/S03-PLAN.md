# S03: Stay logged in — persistent auth with token refresh

**Goal:** User stays logged in across page refreshes and tab reopens. App calls /api/auth/refresh on mount to restore sessions from HttpOnly cookies. Auth state lives in React context, replacing the ephemeral location.state from S02.
**Demo:** 

## Must-Haves

- 1. Page refresh on Home keeps user authenticated (no redirect to login). 2. New tab to / shows authenticated state. 3. Expired/missing cookies redirect to login. 4. Login and Register flows update auth context on success. 5. Logout clears auth state and redirects to login.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Refresh endpoint (backend) — already complete** `est:0m`
  Already built and merged. POST /api/auth/refresh validates refresh_token cookie, rotates tokens, returns userId and username.
  - Files: `services/auth/src/refresh.ts`, `services/auth/src/refresh.test.ts`
  - Verify: Tests already passing — no new work needed

- [x] **T02: Auth context provider with refresh-on-mount** `est:45m`
  Create AuthContext with useAuth() hook. State: { user: { username } | null, isLoading: boolean }. On mount, calls POST /api/auth/refresh — if 200, sets user from response; if 401, sets user to null. Provides login(username) and logout() functions. login() sets user state (actual token issuance happens in login/register API calls). logout() calls a logout endpoint or just clears state and redirects. Wrap App in AuthProvider.
  - Files: `services/frontend/src/auth/AuthContext.tsx`, `services/frontend/src/auth/useAuth.ts`, `services/frontend/src/api/auth.ts`, `services/frontend/src/App.tsx`
  - Verify: Unit test: AuthProvider renders children, useAuth returns expected shape. Integration: mount with valid cookies -> user populated, mount without cookies -> user null.

- [x] **T03: Wire auth context into pages and add logout** `est:45m`
  Replace location.state auth with useAuth() in Home, Login, Register. Home reads user from context instead of location.state — shows loading spinner during refresh, redirects to /login when user is null. Login and Register call auth context login() on success instead of passing state through navigate. Add logout button to Home that clears auth state. Add POST /api/auth/logout backend endpoint that revokes the refresh token and clears cookies.
  - Files: `services/frontend/src/pages/Home.tsx`, `services/frontend/src/pages/Login.tsx`, `services/frontend/src/pages/Register.tsx`, `services/auth/src/logout.ts`, `services/auth/src/app.ts`
  - Verify: Browser verification: 1) Login -> Home shows username. 2) Refresh page -> still authenticated. 3) Click logout -> redirected to login. 4) Refresh after logout -> stays on login. 5) Register -> Home -> refresh -> still authenticated.

## Files Likely Touched

- services/auth/src/refresh.ts
- services/auth/src/refresh.test.ts
- services/frontend/src/auth/AuthContext.tsx
- services/frontend/src/auth/useAuth.ts
- services/frontend/src/api/auth.ts
- services/frontend/src/App.tsx
- services/frontend/src/pages/Home.tsx
- services/frontend/src/pages/Login.tsx
- services/frontend/src/pages/Register.tsx
- services/auth/src/logout.ts
- services/auth/src/app.ts
