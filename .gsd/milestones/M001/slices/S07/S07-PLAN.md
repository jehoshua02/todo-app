# S07: S07

**Goal:** Delete a list with orphan handling
**Demo:** User deletes a list. Tasks reappear in Inbox.

## Must-Haves

- Complete the planned slice outcomes.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Implemented list deletion with system list protection and confirmation modal** `est:retroactive`
  DELETE /lists/:id endpoint, confirmation modal, system list guard. Retroactive tracking stub.
  - Files: `services/tasks/src/lists.ts`, `services/frontend/src/pages/Lists.tsx`
  - Verify: Unit and E2E tests pass

## Files Likely Touched

- services/tasks/src/lists.ts
- services/frontend/src/pages/Lists.tsx
