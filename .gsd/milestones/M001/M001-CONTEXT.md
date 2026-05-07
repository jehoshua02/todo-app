# M001: Full-Stack Task App

**Gathered:** 2026-05-06
**Status:** Ready for planning

## Project Description

A multi-tenant web-based task list application with passkey authentication, multiple lists per user, and a polished mobile-first UI. Five Docker Compose services: React frontend (nginx), auth service (Express), task service (Express), and two dedicated Postgres instances.

## Why This Milestone

This is the entire product — there is no prior milestone. Users need a functional, polished task app they can access from a browser without installation. Passkey auth eliminates password management friction. The service separation positions the architecture for future multi-application expansion.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Open a browser, register with a passkey, and log in
- Create multiple named lists, rename them, reorder them, delete them
- Add tasks with titles, descriptions, and due dates to any list
- Complete tasks (which hides them from view) or delete them
- See only their own data — another user's data is invisible

### Entry point / environment

- Entry point: `docker compose up` → browser at localhost
- Environment: local dev (Docker Compose)
- Live dependencies involved: none (self-contained)

## Completion Class

- Contract complete means: unit + integration tests pass for both backend services
- Integration complete means: Playwright E2E passes against the full Docker stack
- Operational complete means: `docker compose up` brings all 5 services to healthy state from cold start

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A new user can register a passkey, log in, create a list, add a task with a due date, complete it, and confirm it disappears from view — all via Playwright against the running stack
- A second user registers and cannot see the first user's data
- Token refresh works transparently (access token expires, refresh issues new one, user session continues)
- Deleting a list moves its tasks to Inbox

## Architectural Decisions

### Separate Auth Service

**Decision:** Auth runs as its own Express service with dedicated Postgres, issuing JWTs consumed by downstream services.

**Rationale:** User plans future multi-service expansion. Central auth with JWT means one login serves all services. Task service validates JWT signatures without calling auth at runtime.

**Alternatives Considered:**
- Single monolith with auth middleware — rejected because user explicitly wants service separation for future expansion
- Session-in-Postgres — rejected because JWT enables cross-service auth without shared session state

### HS256 Shared Secret for JWT

**Decision:** Use symmetric HS256 signing with a shared secret environment variable readable by both services.

**Rationale:** Simplest implementation for two trusted first-party services. No key distribution infrastructure needed.

**Alternatives Considered:**
- RS256 with JWKS endpoint — deferred until third-party services need to verify tokens
- RS256 with static public key — unnecessary complexity for two co-located services

### Separate Postgres Per Service

**Decision:** Auth-DB and Tasks-DB are independent Postgres containers with their own volumes.

**Rationale:** User explicitly requested this to enforce SRP at the infrastructure level. No cross-DB joins possible, forces clean service boundaries.

**Alternatives Considered:**
- Shared Postgres, separate schemas — rejected by user; too easy to leak across boundaries
- Shared Postgres, separate databases — still shares an instance; user wants full separation

### Prisma ORM

**Decision:** Use Prisma for database access in both services.

**Rationale:** Type-safe queries with TypeScript, declarative schema, clean migration story. Separate schema files per service (each points at its own DB URL).

**Alternatives Considered:**
- Knex/raw SQL — more manual, loses type generation
- TypeORM — heavier, class-based approach less idiomatic with Express

### Docker Network Segmentation

**Decision:** Three isolated Docker networks: `frontend-net` (frontend, auth, tasks), `auth-net` (auth, auth-db), `tasks-net` (tasks, tasks-db).

**Rationale:** User explicitly requested that databases should only be accessible to their owning service, and frontend should only reach API services. Defense in depth — even if a container is compromised, network boundaries limit blast radius.

**Alternatives Considered:**
- Default single network — rejected; all containers can reach all others, violating the isolation requirement
- Per-service network (one network per container pair) — overcomplicated for the topology; three networks cover all the access patterns cleanly

### Three-Screen Navigation

**Decision:** Lists → List → Task. Full-screen views, back button to navigate up. No sidebar.

**Rationale:** Clean mobile pattern. Each screen is a focused view. Avoids sidebar complexity on small screens.

**Alternatives Considered:**
- Sidebar with list selection — rejected by user; they want a list-based drill-down

## Error Handling Strategy

- **Expired access token:** Frontend intercepts 401, silently hits auth service `/refresh`, retries original request. Transparent to user.
- **Expired/revoked refresh token:** Redirect to login. Clear tokens.
- **Passkey failure:** User-facing message ("Passkey not recognized", "Registration failed — try again").
- **API validation errors:** 400 with `{ error: "message", field?: "fieldName" }`. Frontend shows inline errors.
- **Network failure:** Toast/banner with "Connection lost — retrying." Auto-retry with backoff.
- **Postgres unavailable:** 503 from affected service. Frontend shows "Service temporarily unavailable."
- **Unauthorized access attempt:** 403 + server-side logging.
- **Unhandled errors:** 500 with generic client message, full error logged server-side.

## Risks and Unknowns

- **Passkey UX on mobile browsers** — WebAuthn prompt varies by OS/browser. Registration flow can feel awkward. Mitigated by testing early in S01.
- **Token refresh race conditions** — Multiple concurrent requests hitting 401 simultaneously must not all trigger refresh. Need a request queue/mutex in the frontend.
- **Docker networking between services** — Services need to resolve each other by container name. Standard Docker Compose networking but easy to misconfigure.

## Existing Codebase / Prior Art

- Empty project — only `.gitignore` exists
- No existing patterns to follow or migrate from

## Relevant Requirements

- R001-R016 — all active requirements are owned by this milestone
- R012 — separate DB instances shapes the Docker Compose topology
- R015 — auth as independent service shapes the service boundary

## Scope

### In Scope

- Passkey register + login (WebAuthn)
- JWT (HS256) + refresh token rotation
- Lists CRUD (create, rename, delete, reorder) with Inbox as protected system list
- Tasks CRUD (title, description, due date, complete/uncomplete, delete)
- Completed tasks hidden from default view
- Orphaned tasks move to Inbox on list deletion
- Mobile-first three-screen UI (polished but simple)
- Docker Compose with 5 services
- Full testing pyramid (unit + integration + E2E with screenshots)

### Out of Scope / Non-Goals

- Drag-and-drop reordering (deferred)
- Notes on tasks (deferred)
- Show completed toggle (deferred)
- Sharing/collaboration
- Tags, search, dark mode, offline
- Password auth fallback
- Production deployment (this is local dev only)

## Technical Constraints

- HS256 shared secret via environment variable
- Separate Prisma schema per service (auth-db, tasks-db)
- No cross-service runtime calls (task service never calls auth service)
- JWT user_id claim is the only bridge between services
- Multi-stage Docker builds for Node services
- Frontend served by nginx, API requests proxied
- Docker network segmentation: frontend-net, auth-net, tasks-net (databases isolated from frontend)

## Integration Points

- **Auth → Task service:** JWT claims (user_id). No runtime calls.
- **Frontend → Auth service:** `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
- **Frontend → Task service:** `/api/lists`, `/api/lists/:id`, `/api/lists/:id/tasks`, `/api/tasks/:id`
- **Nginx → Backend services:** Reverse proxy by path prefix

## Testing Requirements

- **Unit tests:** Pure logic in both services (token generation/verification, validation, business rules)
- **Integration tests:** Service + DB (auth flows against real Postgres, CRUD operations against real Postgres)
- **E2E tests:** Playwright against full Docker stack (auth flows, list CRUD, task CRUD, data isolation, token refresh)
- **Screenshots:** Every screen captured during E2E runs

## Acceptance Criteria

- **S01 (Auth + Docker):** `docker compose up` healthy. Register passkey returns JWT. Login with passkey returns JWT. Refresh rotates tokens. Invalid credentials return 401.
- **S02 (Lists):** Authenticated user CRUD on lists via API. Inbox exists on registration. Inbox cannot be deleted/renamed. Deleting a list orphans tasks to Inbox. List reordering persists.
- **S03 (Tasks):** Authenticated user CRUD on tasks via API. Completed tasks filtered from default GET. Due dates stored and queryable. User A cannot access User B's tasks.
- **S04 (Frontend):** All three screens render and function on mobile viewport. Auth flow works in browser. Polished, touch-friendly, smooth transitions.
- **S05 (E2E):** Full Playwright suite green. Screenshots of every screen. Data isolation verified between users.

## Open Questions

- Exact refresh token TTL (7 days? 30 days?) — agent's discretion, reasonable default
- Nginx config specifics (proxy timeout, buffer sizes) — agent's discretion, standard defaults
