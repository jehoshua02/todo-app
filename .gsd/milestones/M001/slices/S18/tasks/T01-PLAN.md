---
estimated_steps: 15
estimated_files: 11
skills_used: []
---

# T01: Reorganize frontend src into components/, hooks/, and types/ folders

The frontend src/ has only three folders (api/, auth/, pages/) and all UI logic lives inline in six large page files. This task restructures the tree, extracts shared pieces, and confirms the build is green.

**Why:** Pages like Lists.tsx (16k), TaskDetail.tsx (11k) mix UI rendering, local state, and API calls. Extracting shared components and types makes future slices (theme picker, UX audit) easier to work in.

**Steps:**
1. Read `src/App.tsx`, `src/pages/Lists.tsx`, `src/pages/TaskDetail.tsx`, `src/pages/ListDetail.tsx` to identify repeated JSX patterns and shared TypeScript types.
2. Create `src/types/index.ts` — move or define shared interfaces (Task, List, User) there.
3. Create `src/components/` — extract at minimum: a `Button` component (if a styled button pattern repeats), a `LoadingSpinner` (if a loading state pattern repeats), and any other clearly reusable element. If no natural extraction exists, extract the task card row used in Lists.tsx as `TaskRow`.
4. Create `src/hooks/` — extract at minimum `useAuth` (wraps `useContext(AuthContext)`) from pages that use it.
5. Update all imports in pages and App.tsx to point to new paths.
6. Run `npm run build` and `npm test -- --run` inside `services/frontend/`. Fix any TypeScript or import errors before marking done.

**Must-haves:**
- `src/types/index.ts` exists with at least the Task and List interfaces
- `src/components/` has at least one extracted component file
- `src/hooks/useAuth.ts` exists and wraps AuthContext
- Build exits 0, tests exit 0
- No file in src/ imports from a path that no longer exists

## Inputs

- `services/frontend/src/App.tsx`
- `services/frontend/src/pages/Lists.tsx`
- `services/frontend/src/pages/ListDetail.tsx`
- `services/frontend/src/pages/TaskDetail.tsx`
- `services/frontend/src/auth/AuthContext.tsx`

## Expected Output

- `services/frontend/src/types/index.ts`
- `services/frontend/src/hooks/useAuth.ts`
- `services/frontend/src/components/TaskRow.tsx`

## Verification

cd /home/dev/repos/todo-app/services/frontend && npm run build 2>&1 | tail -5 && npm test -- --run 2>&1 | tail -10
