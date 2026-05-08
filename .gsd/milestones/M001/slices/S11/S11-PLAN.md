# S11: S11

**Goal:** Edit a task
**Demo:** User edits title/description/due date. Changes persist.

## Must-Haves

- Complete the planned slice outcomes.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Implemented task editing for title, description, and due date** `est:retroactive`
  PATCH endpoint supporting title/description/dueDate, edit form in TaskDetail. Retroactive tracking stub.
  - Files: `services/tasks/src/tasks.ts`, `services/frontend/src/pages/TaskDetail.tsx`
  - Verify: Unit and E2E tests pass

## Files Likely Touched

- services/tasks/src/tasks.ts
- services/frontend/src/pages/TaskDetail.tsx
