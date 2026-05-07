---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T03: Inbox auto-creation + GET /api/tasks/lists endpoint

Create lists router. On GET /api/tasks/lists: check if user has any lists, if not create Inbox (is_system=true, position=0). Return all lists for the user ordered by position. TDD: test empty user gets Inbox created, test user with existing lists returns them, test user isolation.

## Inputs

- `Prisma client`
- `requireAuth middleware`
- `Express router`

## Expected Output

- `services/tasks/src/lists.ts with GET /api/tasks/lists`
- `services/tasks/src/lists.test.ts`
- `services/tasks/src/app.ts with route registration`
- `services/tasks/src/db.ts with Prisma client init`

## Verification

All lists endpoint tests pass: auto-creates Inbox for new user, returns existing lists, isolates per user_id
