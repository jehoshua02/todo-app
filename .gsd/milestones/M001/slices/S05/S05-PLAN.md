# S05: User can create a list

**Goal:** User can create a list — taps 'New List', enters a name, and sees it appear alongside Inbox. E2E test proves creation.
**Demo:** User taps 'New List', enters a name, and sees it appear alongside Inbox. E2E test covers creation.

## Must-Haves

- 1. POST /api/tasks/lists creates a new list with validated name
- 2. New list gets position = max(existing positions) + 1
- 3. Name validation: non-empty, trimmed, max 100 chars
- 4. Frontend shows 'New List' button that opens inline input
- 5. After creation, new list appears in the list without full page reload
- 6. E2E test: register → see Inbox → create list → verify it appears
- 7. All existing tests still pass

## Proof Level

- This slice proves: unit + integration + E2E

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: POST /api/tasks/lists endpoint with name validation** `est:medium`
  Add POST handler to listsRouter. Validate name (non-empty after trim, max 100 chars). Calculate position as max(user's existing positions) + 1. Create list with isSystem=false. Return 201 with created list. Return 400 on validation failure. TDD: test valid creation, empty name, whitespace-only name, long name, position calculation.
  - Files: `services/tasks/src/lists.ts`, `services/tasks/src/lists.test.ts`
  - Verify: All unit tests pass: valid creation returns 201, invalid names return 400, position auto-increments correctly

- [x] **T02: Frontend createList API + New List UI with inline input** `est:medium`
  Add createList(name) to tasks.ts API client. Add 'New List' button to Lists page. On tap, show inline text input with save/cancel. On save, call createList, append to local list state. Handle loading and error states. Disable save on empty input.
  - Files: `services/frontend/src/api/tasks.ts`, `services/frontend/src/pages/Lists.tsx`
  - Verify: Frontend builds clean. 'New List' button visible. Can enter name and submit. New list appears in UI.

- [x] **T03: E2E test — create a list and verify it appears** `est:medium`
  Add E2E test: register user → see Inbox → tap New List → enter name → submit → verify new list appears alongside Inbox. Screenshot before and after creation. Verify list count increased.
  - Files: `e2e/auth-flow.spec.ts`
  - Verify: E2E test passes against Docker stack. Screenshots captured showing list before and after creation.

## Files Likely Touched

- services/tasks/src/lists.ts
- services/tasks/src/lists.test.ts
- services/frontend/src/api/tasks.ts
- services/frontend/src/pages/Lists.tsx
- e2e/auth-flow.spec.ts
