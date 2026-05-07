---
estimated_steps: 1
estimated_files: 5
skills_used: []
---

# T04: Registration endpoints with integration tests

Create POST /api/auth/register (generates WebAuthn registration options, stores challenge in memory) and POST /api/auth/register/verify (verifies attestation, creates user + credential in DB, generates access/refresh tokens, stores refresh token hash in DB, sets HTTP-only cookies). Cookie helper: setTokenCookies(res, accessToken, refreshToken). Integration tests: valid registration returns 201 + cookies, duplicate username returns 409, invalid attestation returns 400.

## Inputs

- `T02 — Prisma schema with users/credentials/refresh_tokens tables`
- `T03 — JWT token utilities`

## Expected Output

- `POST /api/auth/register endpoint returning WebAuthn options`
- `POST /api/auth/register/verify endpoint creating user and returning cookies`
- `cookies.ts with setTokenCookies helper`
- `Integration tests passing for success, duplicate, and invalid cases`

## Verification

cd services/auth && npx prisma migrate deploy && npm test -- --grep 'register'
