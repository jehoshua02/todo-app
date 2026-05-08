---
id: S15
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - (none)
patterns_established:
  - Screenshot naming: {theme}-{screen}-{viewport}.png
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-08T02:43:14.509Z
blocker_discovered: false
---

# S15: Flatten screenshot paths

**Screenshot paths flattened from nested viewport dirs to screenshots/{theme}-{screen}-{viewport}.png**

## What Happened

Restructured E2E screenshot output from nested viewport directories (desktop/mobile) to flat theme-aware naming. All 36 screenshot files renamed with default theme prefix. Updated auth-flow.spec.ts screenshot calls. Added volume mount to docker-compose.yml for container-to-host persistence. All 28 E2E tests pass.

## Verification

All 28 E2E tests pass. Screenshots at flat paths matching {theme}-{screen}-{viewport}.png. No old subdirectories remain. PR #25 opened.

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

- `e2e/auth-flow.spec.ts` — Screenshot calls updated to flat naming
- `docker-compose.yml` — Volume mount for screenshot persistence
- `e2e/screenshots/` — 36 screenshots renamed to flat structure
