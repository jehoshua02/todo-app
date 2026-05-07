---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T03: JWT token utilities with unit tests

Create tokens.ts with three pure functions: generateAccessToken(userId) returns signed HS256 JWT with 15min expiry, generateRefreshToken() returns crypto-random 64-byte hex string, verifyAccessToken(token) returns decoded payload or throws. Unit tests cover: valid token decodes, expired token throws, tampered token throws, refresh token is 128-char hex.

## Inputs

- `T01 — auth service package.json with test framework configured`

## Expected Output

- `tokens.ts with generateAccessToken, generateRefreshToken, verifyAccessToken`
- `Unit tests passing for all token operations`

## Verification

cd services/auth && npm test -- --grep 'tokens'
