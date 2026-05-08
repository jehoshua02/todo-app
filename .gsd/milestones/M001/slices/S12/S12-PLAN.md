# S12: S12

**Goal:** Delete a task
**Demo:** User deletes a task permanently.

## Must-Haves

- Complete the planned slice outcomes.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Implemented task deletion with confirmation modal** `est:retroactive`
  DELETE /lists/:listId/tasks/:taskId endpoint, delete button with confirmation modal. Retroactive tracking stub.
  - Files: `services/tasks/src/tasks.ts`, `services/frontend/src/pages/TaskDetail.tsx`
  - Verify: Unit and E2E tests pass

## Files Likely Touched

- services/tasks/src/tasks.ts
- services/frontend/src/pages/TaskDetail.tsx
