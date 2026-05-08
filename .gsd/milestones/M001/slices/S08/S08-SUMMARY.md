---
id: S08
parent: M001
milestone: M001
provides:
  - list-reorder
requires:
  - slice: S05
    provides: list-creation
affects:
  []
key_files:
  - (none)
key_decisions:
  - (none)
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-08T03:56:51.431Z
blocker_discovered: false
---

# S08: Reorder lists

**User reorders lists via move up/down; order persists**

## What Happened

PUT /lists/reorder endpoint, move up/down buttons with optimistic UI, E2E persistence check.

## Verification

Unit tests, E2E reorder test — all passing. Retroactive resync.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

None.
