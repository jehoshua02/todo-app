---
estimated_steps: 1
estimated_files: 5
skills_used: []
---

# T03: Wire auth context into pages and add logout

Replace location.state auth with useAuth() in Home, Login, Register. Home reads user from context instead of location.state — shows loading spinner during refresh, redirects to /login when user is null. Login and Register call auth context login() on success instead of passing state through navigate. Add logout button to Home that clears auth state. Add POST /api/auth/logout backend endpoint that revokes the refresh token and clears cookies.

## Inputs

- `services/frontend/src/auth/AuthContext.tsx`
- `services/frontend/src/auth/useAuth.ts`

## Expected Output

- `Home.tsx uses useAuth() instead of location.state`
- `Login.tsx and Register.tsx call context login() on success`
- `Logout button on Home`
- `POST /api/auth/logout endpoint`
- `app.ts registers logout route`

## Verification

Browser verification: 1) Login -> Home shows username. 2) Refresh page -> still authenticated. 3) Click logout -> redirected to login. 4) Refresh after logout -> stays on login. 5) Register -> Home -> refresh -> still authenticated.
