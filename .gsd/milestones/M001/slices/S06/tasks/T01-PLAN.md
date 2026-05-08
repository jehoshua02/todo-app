---
estimated_steps: 13
estimated_files: 5
skills_used: []
---

# T01: Implemented list rename with PATCH endpoint and inline UI; Inbox protected

Deliver the full rename-a-list feature end-to-end in one task.

Why: S06 is low-risk and tightly scoped — the PATCH endpoint, frontend inline rename UX, and E2E test are interdependent and small enough for a single task.

Do:
1. Add `renameList` handler in the tasks service: PATCH `/:id` that verifies ownership (JWT user_id), rejects system lists with 403, validates name (required, max 100 chars, trim whitespace), and updates via Prisma.
2. Register `listsRouter.patch('/:id', renameList)` route.
3. Add `renameList(id, name)` function in the frontend API layer with error handling.
4. Add inline rename UX in Lists page: clicking a non-system list name enters edit mode with an input field. Enter/blur saves via API, Escape cancels. System list names are not clickable for rename. Show loading state during save and error display on failure.
5. Add unit tests for the PATCH endpoint: 401 unauthenticated, 404 not found / wrong user, 403 system list, 200 happy path, whitespace trimming, 400 empty name, 400 name exceeds 100 chars.
6. Add E2E test scenario: create a list, rename it, verify new name appears, attempt rename on Inbox (verify protection). Capture screenshots.

Constraints:
- Follow the SRP function decomposition pattern from S05 (validate, then act)
- Follow the inline input pattern established by S05's create-list UI
- Inbox is identified by `is_system: true` in the database

## Inputs

- `services/tasks/src/lists.ts`
- `services/tasks/src/lists.test.ts`
- `services/frontend/src/api/tasks.ts`
- `services/frontend/src/pages/Lists.tsx`
- `e2e/auth-flow.spec.ts`

## Expected Output

- `services/tasks/src/lists.ts`
- `services/tasks/src/lists.test.ts`
- `services/frontend/src/api/tasks.ts`
- `services/frontend/src/pages/Lists.tsx`
- `e2e/auth-flow.spec.ts`

## Verification

cd services/tasks && npx vitest run src/lists.test.ts && cd ../../services/frontend && npx tsc --noEmit && cd ../.. && npm run test:e2e
