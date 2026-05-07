---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T05: Frontend lists screen

Create Lists page component. After login, navigate to /lists instead of Home. Fetch GET /api/tasks/lists (with credentials). Display list names in a mobile-friendly list. Show loading state. Show error state. Polished touch-friendly UI with Tailwind. Update routing.

## Inputs

- `AuthContext for user state`
- `Vite proxy config for /api/tasks`
- `Tailwind CSS`

## Expected Output

- `services/frontend/src/pages/Lists.tsx`
- `services/frontend/src/api/tasks.ts with fetchLists()`
- `Updated App.tsx routing`

## Verification

Frontend builds clean. After login, user sees Lists screen with Inbox displayed. Mobile-friendly layout verified in browser.
