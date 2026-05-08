---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T01: Flatten screenshot paths and update E2E tests

Rename all screenshots from screenshots/{viewport}/{screen}.png to screenshots/{theme}-{screen}-{viewport}.png. Update E2E test screenshot calls. Add docker-compose volume mount for screenshot persistence.

## Inputs

- `Existing screenshot naming convention`
- `E2E test screenshot calls`

## Expected Output

- `Flat screenshot files at screenshots/{theme}-{screen}-{viewport}.png`
- `Updated E2E spec`
- `Volume mount in docker-compose.yml`

## Verification

All 28 E2E tests pass. Screenshots at flat paths. No nested directories remain.
