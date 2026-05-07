---
id: T01
parent: S05
milestone: M001
key_files:
  - services/tasks/src/lists.ts
  - services/tasks/src/lists.test.ts
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-07T10:36:00.572Z
blocker_discovered: false
---

# T01: POST /api/tasks/lists endpoint with name validation and auto-position assignment

**POST /api/tasks/lists endpoint with name validation and auto-position assignment**

## What Happened

Added POST handler to listsRouter with TDD. Three SRP functions: validateListName (calculate — trims, validates non-empty, max 100 chars), nextPosition (read — aggregates max position), createList (coordinate — validates, gets position, creates). Returns 201 with created list or 400 on validation failure. 7 new tests all pass.

## Verification

All 18 task service tests pass including 7 new POST tests: valid creation, whitespace trim, position auto-increment, empty/whitespace/missing/long name validation.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx vitest run --reporter=verbose` | 0 | pass | 626ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `services/tasks/src/lists.ts`
- `services/tasks/src/lists.test.ts`
