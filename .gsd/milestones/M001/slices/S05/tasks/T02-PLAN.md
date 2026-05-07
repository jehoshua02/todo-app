---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T02: Frontend createList API + New List UI with inline input

Add createList(name) to tasks.ts API client. Add 'New List' button to Lists page. On tap, show inline text input with save/cancel. On save, call createList, append to local list state. Handle loading and error states. Disable save on empty input.

## Inputs

- `Existing Lists.tsx`
- `Existing tasks.ts API client`

## Expected Output

- `createList API function`
- `New List button + inline input UI`
- `Optimistic list append on creation`

## Verification

Frontend builds clean. 'New List' button visible. Can enter name and submit. New list appears in UI.
