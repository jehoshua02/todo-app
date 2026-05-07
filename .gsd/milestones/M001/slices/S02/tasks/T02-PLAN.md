---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T02: Frontend login page + client-side routing

Install react-router-dom. Add Login.tsx page with username input and 'Login with passkey' button that calls @simplewebauthn/browser startAuthentication against POST /api/auth/login and /api/auth/login/verify. Add fetchLoginOptions and loginWithPasskey to api/auth.ts. Set up React Router in App.tsx with routes: /register -> Register, /login -> Login, / -> redirect to /login. Add navigation links between register and login pages.

## Inputs

- `S01: Frontend scaffold (React + Vite + Tailwind)`
- `S01: @simplewebauthn/browser already installed`
- `T01: Login API endpoints available`

## Expected Output

- `Login.tsx page with WebAuthn authentication ceremony`
- `fetchLoginOptions and loginWithPasskey functions in api/auth.ts`
- `React Router with /register, /login routes and navigation links`

## Verification

cd services/frontend && npx tsc -b && npx vite build
