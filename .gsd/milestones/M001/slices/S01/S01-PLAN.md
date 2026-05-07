# S01: User can register

**Goal:** User opens browser, fills in username, completes WebAuthn passkey ceremony, sees confirmation. Auth service creates user in DB and returns JWT cookies. All 5 Docker services healthy. Frontend cannot reach databases.
**Demo:** User opens browser, fills in username, completes WebAuthn passkey ceremony, sees confirmation. Auth service returns JWT cookies. All 5 Docker services healthy. Frontend cannot reach databases.

## Must-Haves

- docker compose up -d brings all 5 services healthy within 60s. User opens http://localhost:8080, enters username, completes WebAuthn ceremony, sees success confirmation. POST /api/auth/register/verify returns 201 with HTTP-only JWT cookies set. Registration with duplicate username returns 409. Frontend nginx proxies /api/auth/* to auth service.

## Proof Level

- This slice proves: integration

## Integration Closure

Upstream: nothing (first slice). New wiring: docker-compose.yml orchestrates all 5 services with network segmentation. Auth service exposes POST /api/auth/register and POST /api/auth/register/verify. JWT token utilities and cookie helpers established for reuse by S02-S04. Frontend scaffold with React + Vite + Tailwind established for reuse by all subsequent slices.

## Verification

- Auth service logs structured JSON for registration attempts (success/failure). Health endpoint at GET /health returns service status + DB connectivity.

## Tasks

- [x] **T01: Docker Compose foundation with 5 healthy services** `est:45m`
  Create docker-compose.yml with all 5 services (frontend/nginx, auth/Express, tasks/Express, auth-db/Postgres, tasks-db/Postgres), 3 networks (frontend-net, auth-net, tasks-net), 2 named volumes. Each service has a health check. Auth and tasks start as minimal Express apps with GET /health returning 200. Frontend is nginx serving a static placeholder.
  - Files: `docker-compose.yml`, `services/auth/Dockerfile`, `services/auth/package.json`, `services/auth/tsconfig.json`, `services/auth/src/index.ts`, `services/auth/src/health.ts`, `services/tasks/Dockerfile`, `services/tasks/package.json`, `services/tasks/tsconfig.json`, `services/tasks/src/index.ts`, `services/tasks/src/health.ts`, `services/frontend/nginx.conf`, `services/frontend/Dockerfile`, `services/frontend/public/index.html`, `.env.example`
  - Verify: docker compose up -d && sleep 10 && docker compose ps --format json | jq -e 'all(.Health == "healthy" or .State == "running")'

- [x] **T02: Auth-DB Prisma schema and migration** `est:30m`
  Initialize Prisma in the auth service. Create schema with users table (id, username, created_at), credentials table (id, user_id FK, credential_id, public_key, counter, transports, created_at), and refresh_tokens table (id, user_id FK, token_hash, expires_at, revoked, created_at). Run prisma migrate dev to generate migration. Create db.ts module exporting PrismaClient singleton.
  - Files: `services/auth/prisma/schema.prisma`, `services/auth/prisma/migrations/`, `services/auth/src/db.ts`, `services/auth/package.json`
  - Verify: cd services/auth && npx prisma migrate deploy && node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.$connect().then(()=>{console.log('ok');process.exit(0)})"

- [x] **T03: JWT token utilities with unit tests** `est:30m`
  Create tokens.ts with three pure functions: generateAccessToken(userId) returns signed HS256 JWT with 15min expiry, generateRefreshToken() returns crypto-random 64-byte hex string, verifyAccessToken(token) returns decoded payload or throws. Unit tests cover: valid token decodes, expired token throws, tampered token throws, refresh token is 128-char hex.
  - Files: `services/auth/src/tokens.ts`, `services/auth/tests/tokens.test.ts`, `services/auth/package.json`
  - Verify: cd services/auth && npm test -- --grep 'tokens'

- [x] **T04: Registration endpoints with integration tests** `est:1h`
  Create POST /api/auth/register (generates WebAuthn registration options, stores challenge in memory) and POST /api/auth/register/verify (verifies attestation, creates user + credential in DB, generates access/refresh tokens, stores refresh token hash in DB, sets HTTP-only cookies). Cookie helper: setTokenCookies(res, accessToken, refreshToken). Integration tests: valid registration returns 201 + cookies, duplicate username returns 409, invalid attestation returns 400.
  - Files: `services/auth/src/routes/register.ts`, `services/auth/src/routes/register-verify.ts`, `services/auth/src/cookies.ts`, `services/auth/tests/register.test.ts`, `services/auth/src/index.ts`
  - Verify: cd services/auth && npx prisma migrate deploy && npm test -- --grep 'register'

- [x] **T05: Frontend scaffold with registration form** `est:1h`
  Initialize React + Vite + TypeScript + Tailwind in services/frontend/src. Create registration page: username input, Register button triggers WebAuthn ceremony via @simplewebauthn/browser, calls POST /api/auth/register then POST /api/auth/register/verify, shows success/error state. Update nginx.conf to proxy /api/auth/* to auth service and serve SPA. Update Dockerfile for multi-stage build (npm run build then nginx serves dist).
  - Files: `services/frontend/package.json`, `services/frontend/tsconfig.json`, `services/frontend/vite.config.ts`, `services/frontend/tailwind.config.js`, `services/frontend/postcss.config.js`, `services/frontend/index.html`, `services/frontend/src/main.tsx`, `services/frontend/src/App.tsx`, `services/frontend/src/pages/Register.tsx`, `services/frontend/src/api/auth.ts`, `services/frontend/nginx.conf`, `services/frontend/Dockerfile`
  - Verify: cd services/frontend && npm run build && docker compose up -d && curl -s http://localhost:8080 | grep -q 'root'

- [x] **T06: Token refresh and logout endpoints with integration tests** `est:45m`
  Implement POST /api/auth/refresh: read refresh token from cookie, look up in DB, verify not expired, generate new access+refresh token pair, revoke old refresh token (write), store new refresh token (write), return new cookies. Implement POST /api/auth/logout: read refresh token from cookie, revoke it in DB (write), clear cookies (write). Functions: lookupRefreshToken (read), revokeRefreshToken (write), rotateRefreshToken (coordinate). Integration tests: refresh with valid token returns new cookies, refresh with expired token returns 401, refresh with revoked token returns 401, logout clears cookies and revokes token.
  - Files: `services/auth/src/routes/refresh.ts`, `services/auth/src/routes/logout.ts`, `services/auth/tests/refresh.test.ts`, `services/auth/tests/logout.test.ts`, `services/auth/src/index.ts`
  - Verify: cd services/auth && npm test -- --grep 'refresh|logout'

- [x] **T07: Network segmentation verification and slice integration test** `est:45m`
  Write a shell script and integration test that verifies Docker network segmentation: frontend container CAN reach auth:3000 and tasks:4000, frontend container CANNOT reach auth-db:5432 or tasks-db:5432, auth container CAN reach auth-db:5432, auth container CANNOT reach tasks-db:5432, tasks container CAN reach tasks-db:5432, tasks container CANNOT reach auth-db:5432. Also write a full-flow integration test: docker compose up, register a user (simulated WebAuthn), login, refresh token, verify JWT contains userId claim. This is the slice-level proof.
  - Files: `scripts/verify-network.sh`, `services/auth/tests/integration/full-flow.test.ts`
  - Verify: bash scripts/verify-network.sh && cd services/auth && npm test -- --grep 'full flow'

## Files Likely Touched

- docker-compose.yml
- services/auth/Dockerfile
- services/auth/package.json
- services/auth/tsconfig.json
- services/auth/src/index.ts
- services/auth/src/health.ts
- services/tasks/Dockerfile
- services/tasks/package.json
- services/tasks/tsconfig.json
- services/tasks/src/index.ts
- services/tasks/src/health.ts
- services/frontend/nginx.conf
- services/frontend/Dockerfile
- services/frontend/public/index.html
- .env.example
- services/auth/prisma/schema.prisma
- services/auth/prisma/migrations/
- services/auth/src/db.ts
- services/auth/src/tokens.ts
- services/auth/tests/tokens.test.ts
- services/auth/src/routes/register.ts
- services/auth/src/routes/register-verify.ts
- services/auth/src/cookies.ts
- services/auth/tests/register.test.ts
- services/frontend/package.json
- services/frontend/tsconfig.json
- services/frontend/vite.config.ts
- services/frontend/tailwind.config.js
- services/frontend/postcss.config.js
- services/frontend/index.html
- services/frontend/src/main.tsx
- services/frontend/src/App.tsx
- services/frontend/src/pages/Register.tsx
- services/frontend/src/api/auth.ts
- services/auth/src/routes/refresh.ts
- services/auth/src/routes/logout.ts
- services/auth/tests/refresh.test.ts
- services/auth/tests/logout.test.ts
- scripts/verify-network.sh
- services/auth/tests/integration/full-flow.test.ts
