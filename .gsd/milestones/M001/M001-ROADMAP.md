# M001: Full-Stack Todo App

**Vision:** A multi-tenant todo app with passkey authentication, multiple lists per user, and a polished mobile-first UI. Five Docker Compose services (frontend, auth, tasks, auth-db, tasks-db) with network segmentation. Each slice delivers one user-facing capability end-to-end.

## Success Criteria

- docker compose up brings all 5 services to healthy state from cold start
- New user can register a passkey and receive JWT tokens
- Registered user can login with passkey and receive JWT tokens
- Authenticated session persists across page reloads via token refresh
- User can logout and session is invalidated
- Authenticated user can create a list and see it on screen
- Authenticated user can view all their lists
- Authenticated user can create a task within a list
- Authenticated user can view tasks in a list
- Authenticated user can mark a task complete
- Authenticated user can edit a task's details
- Authenticated user can delete a task
- Authenticated user can delete a list (tasks move to Inbox)
- User A cannot see User B's data

## Slices

- [x] **S01: S01** `risk:high` `depends:[]`
  > After this: User opens browser, fills in username, completes WebAuthn passkey ceremony, sees confirmation. Auth service returns JWT cookies. All 5 Docker services healthy. Frontend cannot reach databases.

- [ ] **S02: User can login** `risk:medium` `depends:[S01]`
  > After this: Previously registered user opens login form, completes WebAuthn assertion, receives JWT cookies, sees authenticated state in frontend.

- [ ] **S03: User can stay logged in** `risk:medium` `depends:[S02]`
  > After this: User is logged in, access token expires, next request transparently refreshes tokens, user remains authenticated without re-login.

- [ ] **S04: User can logout** `risk:low` `depends:[S03]`
  > After this: Logged-in user clicks logout, cookies cleared, refresh token revoked in DB, user sees login screen, cannot access protected routes.

- [ ] **S05: User can create a list** `risk:medium` `depends:[S02]`
  > After this: Authenticated user sees lists screen with auto-created Inbox, taps create, enters list name, new list appears on screen.

- [ ] **S06: User can view their lists** `risk:low` `depends:[S05]`
  > After this: Authenticated user sees all their lists on the lists screen. A second user's lists are not visible.

- [ ] **S07: User can create a task** `risk:low` `depends:[S05]`
  > After this: User navigates to a list, taps create task, enters title/description/due date, task appears in the list.

- [ ] **S08: User can view tasks in a list** `risk:low` `depends:[S07]`
  > After this: User taps a list, sees all incomplete tasks in that list with title, due date. Tasks from other lists or users not shown.

- [ ] **S09: User can complete a task** `risk:low` `depends:[S08]`
  > After this: User taps checkbox on a task, task marked complete, disappears from list view. Task exists in DB as completed.

- [ ] **S10: User can edit a task** `risk:low` `depends:[S08]`
  > After this: User taps a task, sees detail screen with editable title/description/due date, saves changes, updated values persist.

- [ ] **S11: User can delete a task** `risk:low` `depends:[S08]`
  > After this: User deletes a task from list view or detail screen, task removed, no longer visible.

- [ ] **S12: User can delete a list** `risk:low` `depends:[S06,S07]`
  > After this: User deletes a list, its tasks move to Inbox, list removed from lists screen. Attempting to delete Inbox shows error.

## Boundary Map

### S01 → S02, S03, S04

Produces:
- `docker-compose.yml` — 5 services, 3 networks, 2 volumes, health checks
- Auth service running on `auth:3001` within Docker network
- Auth-DB schema: users table, credentials table, refresh_tokens table (Prisma)
- `POST /api/auth/register` — passkey registration endpoint
- JWT token utilities: `generateAccessToken(userId)`, `generateRefreshToken(userId)`, `verifyToken(token)`
- JWT cookies: `access_token` and `refresh_token` as HTTP-only secure cookies
- `JWT_SECRET` environment variable shared with tasks service
- Frontend app scaffold: React + Vite + TypeScript + Tailwind, served via nginx
- Frontend registration form component

Consumes:
- nothing (first slice)

### S02 → S03, S04, S05

Produces:
- `POST /api/auth/login` — passkey login endpoint
- Frontend login form component
- Frontend authenticated/unauthenticated routing

Consumes from S01:
- Auth-DB schema (users, credentials tables)
- JWT token utilities and cookie transport
- Docker infrastructure

### S03 → S04

Produces:
- `POST /api/auth/refresh` — token refresh endpoint
- Frontend auth interceptor (detects 401, retries with refreshed tokens)
- Persistent auth state across page reloads

Consumes from S02:
- Login flow (refresh token must exist in DB from login)
- Frontend auth routing

### S04 → (terminal for auth)

Produces:
- `POST /api/auth/logout` — logout endpoint (revokes refresh token, clears cookies)
- Frontend logout button and redirect to login

Consumes from S03:
- Refresh token in DB to revoke
- Frontend auth state to clear

### S05 → S06, S07, S12

Produces:
- Tasks service running on `tasks:3002` within Docker network
- Tasks-DB schema: lists table (Prisma migration)
- JWT middleware for tasks service (`req.userId` from verified token)
- `POST /api/lists` — create list endpoint
- Inbox auto-creation logic
- Frontend create-list form and initial lists screen

Consumes from S01:
- `JWT_SECRET` for token verification
- Docker infrastructure (tasks service, tasks-db already in compose from S01)

Consumes from S02:
- JWT cookies set by login (frontend sends cookies to tasks service)

### S06 → S12

Produces:
- `GET /api/lists` — list all user's lists
- Frontend lists screen with full list rendering

Consumes from S05:
- Lists table, JWT middleware, Inbox logic

### S07 → S08, S09, S10, S11, S12

Produces:
- Tasks-DB schema addition: tasks table (Prisma migration)
- `POST /api/lists/:id/tasks` — create task endpoint
- Frontend task creation form within list view

Consumes from S05:
- Lists table (foreign key: tasks.list_id → lists.id)
- JWT middleware

### S08 → S09, S10, S11

Produces:
- `GET /api/lists/:id/tasks` — list tasks in a list (excludes completed by default)
- Frontend list-detail screen with task rendering
- Navigation: lists screen → list detail

Consumes from S07:
- Tasks table and create-task endpoint (need tasks to view)

### S09 (terminal)

Produces:
- `PATCH /api/tasks/:id/complete` — toggle completion
- Frontend checkbox/gesture for completion

Consumes from S08:
- Task list view (need to see tasks to complete them)
- Tasks table

### S10 (terminal)

Produces:
- `PUT /api/tasks/:id` — update task fields
- Frontend task-detail screen with edit form
- Navigation: list detail → task detail

Consumes from S08:
- Task list view (need to tap a task to edit it)

### S11 (terminal)

Produces:
- `DELETE /api/tasks/:id` — delete task
- Frontend delete action with confirmation

Consumes from S08:
- Task list view (need to see tasks to delete them)

### S12 (terminal)

Produces:
- `DELETE /api/lists/:id` — delete list with cascade to Inbox
- Inbox deletion protection (409)
- Frontend delete-list action with confirmation

Consumes from S06:
- Lists screen (need to see lists to delete them)

Consumes from S07:
- Tasks table (cascade moves tasks to Inbox)
