# S15: Flatten screenshot paths

**Goal:** Flatten screenshot paths from nested viewport directories to {theme}-{screen}-{viewport}.png
**Demo:** Screenshots at screenshots/{theme}-{screen}-{viewport}.png.

## Must-Haves

- Complete the planned slice outcomes.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Flatten screenshot paths and update E2E tests** `est:30m`
  Rename all screenshots from screenshots/{viewport}/{screen}.png to screenshots/{theme}-{screen}-{viewport}.png. Update E2E test screenshot calls. Add docker-compose volume mount for screenshot persistence.
  - Files: `e2e/auth-flow.spec.ts`, `docker-compose.yml`, `e2e/screenshots/`
  - Verify: All 28 E2E tests pass. Screenshots at flat paths. No nested directories remain.

## Files Likely Touched

- e2e/auth-flow.spec.ts
- docker-compose.yml
- e2e/screenshots/
