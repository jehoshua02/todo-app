---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T02: Auth context provider with refresh-on-mount

Create AuthContext with useAuth() hook. State: { user: { username } | null, isLoading: boolean }. On mount, calls POST /api/auth/refresh — if 200, sets user from response; if 401, sets user to null. Provides login(username) and logout() functions. login() sets user state (actual token issuance happens in login/register API calls). logout() calls a logout endpoint or just clears state and redirects. Wrap App in AuthProvider.

## Inputs

- `services/auth/src/refresh.ts (backend contract: POST /api/auth/refresh returns { userId, username } or 401)`

## Expected Output

- `AuthContext.tsx — context definition and AuthProvider component`
- `useAuth.ts — hook that reads context`
- `refreshSession() added to api/auth.ts`
- `App.tsx wraps routes in AuthProvider`

## Verification

Unit test: AuthProvider renders children, useAuth returns expected shape. Integration: mount with valid cookies -> user populated, mount without cookies -> user null.
