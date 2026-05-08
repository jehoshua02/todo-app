# S09: S09

**Goal:** Create a task
**Demo:** User creates a task with title in a list.

## Must-Haves

- Complete the planned slice outcomes.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Implemented task creation with inline form in list detail** `est:retroactive`
  POST /lists/:listId/tasks endpoint, inline creation form in ListDetail. Retroactive tracking stub.
  - Files: `services/tasks/src/tasks.ts`, `services/frontend/src/pages/ListDetail.tsx`
  - Verify: Unit and E2E tests pass

## Files Likely Touched

- services/tasks/src/tasks.ts
- services/frontend/src/pages/ListDetail.tsx
