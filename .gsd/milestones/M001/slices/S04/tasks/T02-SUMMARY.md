---
id: T02
parent: S04
milestone: M001
key_files:
  - services/tasks/src/auth.ts
  - services/tasks/src/auth.test.ts
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-07T10:30:33.021Z
blocker_discovered: false
---

# T02: JWT auth middleware extracts userId from access_token cookie, rejects unauthenticated requests

**JWT auth middleware extracts userId from access_token cookie, rejects unauthenticated requests**

## What Happened

Created Express middleware reading access_token cookie, verifying HS256 JWT, extracting sub claim as userId. Returns 401 on missing/invalid/expired tokens. TDD with full test coverage.

## Verification

All auth middleware tests pass: valid token, expired token, missing token, malformed token.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm test -- auth.test.ts` | 0 | pass | 3000ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `services/tasks/src/auth.ts`
- `services/tasks/src/auth.test.ts`
