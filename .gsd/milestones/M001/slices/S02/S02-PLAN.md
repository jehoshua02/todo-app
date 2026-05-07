# S02: User can login

**Goal:** Previously registered user opens login form, completes WebAuthn assertion, receives JWT cookies, sees authenticated state in frontend.
**Demo:** Previously registered user opens login form, completes WebAuthn assertion, receives JWT cookies, sees authenticated state in frontend.

## Must-Haves

- User navigates to /login, enters username, completes WebAuthn assertion ceremony, receives HTTP-only JWT cookies, and sees authenticated UI showing their username. Invalid username returns 404. Invalid assertion returns 400.

## Proof Level

- This slice proves: integration

## Integration Closure

Upstream: S01 provides auth-DB schema (users, credentials, refresh_tokens), JWT utilities, cookie helpers, challenge store, Docker infrastructure, frontend scaffold. New wiring: POST /api/auth/login and /api/auth/login/verify endpoints added to auth service. React Router added for client-side routing. Frontend login page calls WebAuthn authentication API. Authenticated state displayed after successful login or registration.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [ ] **T01: Login endpoints with WebAuthn assertion + integration tests** `est:1h`
  Create POST /api/auth/login (takes username, looks up user + credentials in DB, generates WebAuthn authentication options via @simplewebauthn/server generateAuthenticationOptions, stores challenge). Create POST /api/auth/login/verify (verifies assertion response via verifyAuthenticationResponse, updates credential counter, generates JWT access + refresh tokens, stores refresh token hash, sets HTTP-only cookies). Wire routes in app.ts. Integration tests: successful login returns 200 + cookies, unknown username returns 404, invalid assertion returns 400.
  - Files: `services/auth/src/login.ts`, `services/auth/src/login.test.ts`, `services/auth/src/app.ts`
  - Verify: cd services/auth && npm test

- [ ] **T02: Frontend login page + client-side routing** `est:45m`
  Install react-router-dom. Add Login.tsx page with username input and 'Login with passkey' button that calls @simplewebauthn/browser startAuthentication against POST /api/auth/login and /api/auth/login/verify. Add fetchLoginOptions and loginWithPasskey to api/auth.ts. Set up React Router in App.tsx with routes: /register -> Register, /login -> Login, / -> redirect to /login. Add navigation links between register and login pages.
  - Files: `services/frontend/src/pages/Login.tsx`, `services/frontend/src/api/auth.ts`, `services/frontend/src/App.tsx`, `services/frontend/package.json`
  - Verify: cd services/frontend && npx tsc -b && npx vite build

- [ ] **T03: Authenticated state display after login or registration** `est:30m`
  After successful login or registration, display an authenticated view showing the username and a placeholder message (e.g. 'Welcome, {username}. Your tasks will appear here.'). Parse the user info from the login/register API response (not from JWT — keep it simple). Both Register.tsx success state and Login.tsx success state navigate to or display this authenticated view. This proves the full flow: register -> authenticated, login -> authenticated.
  - Files: `services/frontend/src/pages/Home.tsx`, `services/frontend/src/App.tsx`, `services/frontend/src/pages/Register.tsx`, `services/frontend/src/pages/Login.tsx`
  - Verify: cd services/frontend && npx tsc -b && npx vite build

## Files Likely Touched

- services/auth/src/login.ts
- services/auth/src/login.test.ts
- services/auth/src/app.ts
- services/frontend/src/pages/Login.tsx
- services/frontend/src/api/auth.ts
- services/frontend/src/App.tsx
- services/frontend/package.json
- services/frontend/src/pages/Home.tsx
- services/frontend/src/pages/Register.tsx
