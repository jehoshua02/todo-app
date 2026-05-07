---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T01: POST /api/tasks/lists endpoint with name validation

Add POST handler to listsRouter. Validate name (non-empty after trim, max 100 chars). Calculate position as max(user's existing positions) + 1. Create list with isSystem=false. Return 201 with created list. Return 400 on validation failure. TDD: test valid creation, empty name, whitespace-only name, long name, position calculation.

## Inputs

- `Existing lists.ts with GET handler`
- `Existing lists.test.ts with GET tests`
- `Prisma List model`

## Expected Output

- `POST /api/tasks/lists endpoint`
- `Unit tests for POST endpoint`

## Verification

All unit tests pass: valid creation returns 201, invalid names return 400, position auto-increments correctly
