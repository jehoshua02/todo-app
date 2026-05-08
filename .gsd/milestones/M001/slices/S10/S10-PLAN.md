# S10: S10

**Goal:** Complete a task
**Demo:** User marks a task complete. Visual state changes.

## Must-Haves

- Complete the planned slice outcomes.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Implemented task completion toggle with checkbox and active-list filtering** `est:retroactive`
  PATCH endpoint with completed boolean, checkbox UI, completed tasks filtered from view. Retroactive tracking stub.
  - Files: `services/tasks/src/tasks.ts`, `services/frontend/src/pages/ListDetail.tsx`, `services/frontend/src/pages/TaskDetail.tsx`
  - Verify: Unit and E2E tests pass

## Files Likely Touched

- services/tasks/src/tasks.ts
- services/frontend/src/pages/ListDetail.tsx
- services/frontend/src/pages/TaskDetail.tsx
