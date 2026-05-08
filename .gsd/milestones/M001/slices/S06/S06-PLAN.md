# S06: S06

**Goal:** User can rename a list. Inbox (system list) cannot be renamed.
**Demo:** User renames a list. Inbox cannot be renamed.

## Must-Haves

- PATCH `/api/tasks/lists/:id` renames a user-owned list with name validation (non-empty, trimmed, max 100 chars)
- System lists (Inbox) return 403 on rename attempt
- Frontend inline rename: clicking a non-system list name opens an inline input; Enter/blur saves, Escape cancels
- Unit tests cover happy path, auth, 404, 403 system list, validation errors
- E2E test covers rename flow and Inbox protection on both desktop and mobile viewports

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Implemented list rename with PATCH endpoint and inline UI; Inbox protected** `est:1h`
  Deliver the full rename-a-list feature end-to-end in one task.
  - Files: `services/tasks/src/lists.ts`, `services/tasks/src/lists.test.ts`, `services/frontend/src/api/tasks.ts`, `services/frontend/src/pages/Lists.tsx`, `e2e/auth-flow.spec.ts`
  - Verify: cd services/tasks && npx vitest run src/lists.test.ts && cd ../../services/frontend && npx tsc --noEmit && cd ../.. && npm run test:e2e

## Files Likely Touched

- services/tasks/src/lists.ts
- services/tasks/src/lists.test.ts
- services/frontend/src/api/tasks.ts
- services/frontend/src/pages/Lists.tsx
- e2e/auth-flow.spec.ts
