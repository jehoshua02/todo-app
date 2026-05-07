---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T01: Login endpoints with WebAuthn assertion + integration tests

Create POST /api/auth/login (takes username, looks up user + credentials in DB, generates WebAuthn authentication options via @simplewebauthn/server generateAuthenticationOptions, stores challenge). Create POST /api/auth/login/verify (verifies assertion response via verifyAuthenticationResponse, updates credential counter, generates JWT access + refresh tokens, stores refresh token hash, sets HTTP-only cookies). Wire routes in app.ts. Integration tests: successful login returns 200 + cookies, unknown username returns 404, invalid assertion returns 400.

## Inputs

- `S01: Prisma schema (users, credentials, refresh_tokens)`
- `S01: JWT utilities (generateAccessToken, generateRefreshToken)`
- `S01: cookie helpers (setTokenCookies)`
- `S01: challenge store (storeChallenge, getChallenge, deleteChallenge)`
- `S01: @simplewebauthn/server already installed`

## Expected Output

- `POST /api/auth/login endpoint returning WebAuthn authentication options`
- `POST /api/auth/login/verify endpoint verifying assertion and setting JWT cookies`
- `Integration tests passing for success, unknown user, and invalid assertion cases`

## Verification

cd services/auth && npm test
