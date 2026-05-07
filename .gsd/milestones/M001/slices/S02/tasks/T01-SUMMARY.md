---
id: T01
parent: S02
milestone: M001
key_files:
  - services/auth/src/login.ts
  - services/auth/src/login.test.ts
key_decisions:
  - Reused the same cookie configuration (HttpOnly, strict sameSite) established in registration for login token issuance
  - Login challenge stored in module-level Map, same pattern as registration
duration: 
verification_result: passed
completed_at: 2026-05-07T07:23:21.158Z
blocker_discovered: false
---

# T01: Login endpoints with WebAuthn assertion verification and integration tests

**Login endpoints with WebAuthn assertion verification and integration tests**

## What Happened

Implemented POST /api/auth/login (returns challenge + allowCredentials for the registered user) and POST /api/auth/login/verify (verifies the WebAuthn assertion response against the stored credential in the database). On successful verification, issues access_token and refresh_token as HttpOnly cookies. Integration tests cover: missing username (400), unregistered user (404), invalid assertion (401), and successful login flow with cookie verification.

## Verification

Integration tests pass — covers missing username, unregistered user, invalid assertion, and happy-path login with cookie issuance.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm test -- --grep login` | 0 | pass | 3200ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `services/auth/src/login.ts`
- `services/auth/src/login.test.ts`
