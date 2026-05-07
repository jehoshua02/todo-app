---
estimated_steps: 1
estimated_files: 12
skills_used: []
---

# T05: Frontend scaffold with registration form

Initialize React + Vite + TypeScript + Tailwind in services/frontend/src. Create registration page: username input, Register button triggers WebAuthn ceremony via @simplewebauthn/browser, calls POST /api/auth/register then POST /api/auth/register/verify, shows success/error state. Update nginx.conf to proxy /api/auth/* to auth service and serve SPA. Update Dockerfile for multi-stage build (npm run build then nginx serves dist).

## Inputs

- `T01 — Docker Compose with frontend service and nginx`
- `T04 — Registration endpoints running in auth service`

## Expected Output

- `React + Vite + Tailwind app with registration page`
- `WebAuthn ceremony triggered from browser via @simplewebauthn/browser`
- `nginx proxying /api/auth/* to auth service`
- `Multi-stage Dockerfile building and serving SPA`

## Verification

cd services/frontend && npm run build && docker compose up -d && curl -s http://localhost:8080 | grep -q 'root'
