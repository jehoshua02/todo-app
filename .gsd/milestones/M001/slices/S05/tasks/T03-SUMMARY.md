---
id: T03
parent: S05
milestone: M001
key_files:
  - e2e/auth-flow.spec.ts
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-07T10:36:11.540Z
blocker_discovered: false
---

# T03: E2E test for list creation — register, create two lists, verify counts and screenshots

**E2E test for list creation — register, create two lists, verify counts and screenshots**

## What Happened

Added 'user can create a new list' E2E test. Registers fresh user, verifies Inbox only, taps New List, enters 'Shopping', saves, verifies it appears (count=2). Creates second list 'Work', verifies count=3. Screenshots captured at each stage on both desktop and mobile viewports. All 14 tests pass (7 scenarios x 2 viewports).

## Verification

All 14 E2E tests pass against Docker stack including new list creation test. Screenshots captured: lists-before-create, lists-after-create, lists-three-lists for both desktop and mobile.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `docker compose --profile e2e run --rm e2e` | 0 | pass | 6400ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `e2e/auth-flow.spec.ts`
