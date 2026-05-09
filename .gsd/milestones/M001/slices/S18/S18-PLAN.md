# S18: Discuss frontend code organization

**Goal:** Reorganize the React frontend source tree into a clear, scalable folder structure: extract reusable components from page files, add a `hooks/` folder for shared state logic, add a `types/` folder for shared TypeScript interfaces, and keep tests colocated. Build must still pass after the move.
**Demo:** Frontend folder structure agreed upon and reorganized.

## Must-Haves

- `services/frontend/src/` has folders: `api/`, `auth/`, `components/`, `hooks/`, `pages/`, `types/`
- At least one shared component extracted from a page file into `components/`
- At least one shared TypeScript type/interface moved to `types/`
- All existing imports updated — no broken references
- `cd services/frontend && npm run build` exits 0
- `cd services/frontend && npm test -- --run` exits 0

## Proof Level

- This slice proves: Contract — build and test pass in the worktree; no live Docker stack required.

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [ ] **T01: Reorganize frontend src into components/, hooks/, and types/ folders** `est:1h`
  The frontend src/ has only three folders (api/, auth/, pages/) and all UI logic lives inline in six large page files. This task restructures the tree, extracts shared pieces, and confirms the build is green.
  - Files: `services/frontend/src/App.tsx`, `services/frontend/src/pages/Lists.tsx`, `services/frontend/src/pages/ListDetail.tsx`, `services/frontend/src/pages/TaskDetail.tsx`, `services/frontend/src/pages/Home.tsx`, `services/frontend/src/pages/Login.tsx`, `services/frontend/src/pages/Register.tsx`, `services/frontend/src/auth/AuthContext.tsx`, `services/frontend/src/types/index.ts`, `services/frontend/src/components/TaskRow.tsx`, `services/frontend/src/hooks/useAuth.ts`
  - Verify: cd /home/dev/repos/todo-app/services/frontend && npm run build 2>&1 | tail -5 && npm test -- --run 2>&1 | tail -10

## Files Likely Touched

- services/frontend/src/App.tsx
- services/frontend/src/pages/Lists.tsx
- services/frontend/src/pages/ListDetail.tsx
- services/frontend/src/pages/TaskDetail.tsx
- services/frontend/src/pages/Home.tsx
- services/frontend/src/pages/Login.tsx
- services/frontend/src/pages/Register.tsx
- services/frontend/src/auth/AuthContext.tsx
- services/frontend/src/types/index.ts
- services/frontend/src/components/TaskRow.tsx
- services/frontend/src/hooks/useAuth.ts
