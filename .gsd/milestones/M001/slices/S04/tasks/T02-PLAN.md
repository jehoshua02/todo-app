---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T02: JWT auth middleware for task service

Create Express middleware that reads access_token from cookies, verifies JWT signature using shared HS256 secret, extracts user_id (sub claim), and attaches it to the request. Returns 401 on missing/invalid token. TDD: test with valid token, expired token, missing token, malformed token.

## Inputs

- `JWT_SECRET env var`
- `jsonwebtoken library`
- `cookie-parser`

## Expected Output

- `services/tasks/src/auth.ts with requireAuth middleware`
- `services/tasks/src/auth.test.ts with 4+ test cases`

## Verification

All auth middleware tests pass: valid token extracts user_id, invalid/missing/expired tokens return 401
