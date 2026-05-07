---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T01: Refresh endpoint (backend) — already complete

Already built and merged. POST /api/auth/refresh validates refresh_token cookie, rotates tokens, returns userId and username.

## Inputs

- `services/auth/src/tokens.ts`
- `services/auth/src/cookies.ts`

## Expected Output

- `POST /api/auth/refresh endpoint`
- `Token rotation with revocation`
- `Integration tests`

## Verification

Tests already passing — no new work needed
