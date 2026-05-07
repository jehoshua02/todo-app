# S04: User can see their lists (task service bootstrap + Inbox)

**Goal:** Authenticated user can see their lists — task service bootstrap with Prisma, JWT middleware, Inbox auto-creation, GET /api/tasks/lists endpoint, frontend lists screen, E2E test
**Demo:** After registering and logging in, user sees a Lists screen with their auto-created Inbox. JWT middleware protects all task service endpoints. Polished mobile UI. E2E test proves it.

## Must-Haves

- 1. Task service has Prisma schema with lists table and migration applied\n2. JWT middleware extracts user_id from access_token cookie and rejects unauthenticated requests\n3. First authenticated request auto-creates an Inbox list for the user\n4. GET /api/tasks/lists returns the user's lists (at minimum Inbox)\n5. Frontend shows a Lists screen after login displaying the user's lists\n6. E2E test proves: login → see Inbox on lists screen\n7. All existing tests still pass

## Proof Level

- This slice proves: integration + E2E

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Prisma schema + migration for lists table** `est:medium`
  Add Prisma to task service. Define List model with id, user_id, name, is_system, position, created_at. Generate migration. Verify migration applies against tasks-db.
  - Files: `services/tasks/prisma/schema.prisma`, `services/tasks/package.json`, `services/tasks/prisma.config.ts`, `services/tasks/tsconfig.json`
  - Verify: Migration applies cleanly: npx prisma migrate deploy succeeds against tasks-db

- [x] **T02: JWT auth middleware for task service** `est:medium`
  Create Express middleware that reads access_token from cookies, verifies JWT signature using shared HS256 secret, extracts user_id (sub claim), and attaches it to the request. Returns 401 on missing/invalid token. TDD: test with valid token, expired token, missing token, malformed token.
  - Files: `services/tasks/src/auth.ts`, `services/tasks/src/auth.test.ts`, `services/tasks/package.json`
  - Verify: All auth middleware tests pass: valid token extracts user_id, invalid/missing/expired tokens return 401

- [x] **T03: Inbox auto-creation + GET /api/tasks/lists endpoint** `est:medium`
  Create lists router. On GET /api/tasks/lists: check if user has any lists, if not create Inbox (is_system=true, position=0). Return all lists for the user ordered by position. TDD: test empty user gets Inbox created, test user with existing lists returns them, test user isolation.
  - Files: `services/tasks/src/lists.ts`, `services/tasks/src/lists.test.ts`, `services/tasks/src/app.ts`, `services/tasks/src/db.ts`
  - Verify: All lists endpoint tests pass: auto-creates Inbox for new user, returns existing lists, isolates per user_id

- [x] **T04: Docker integration — add JWT_SECRET to task service, rebuild** `est:small`
  Add JWT_SECRET env var to task service in docker-compose.yml. Add cookie-parser and jsonwebtoken dependencies. Update Dockerfile to run prisma migrate deploy on startup. Rebuild and verify all containers come up healthy.
  - Files: `docker-compose.yml`, `services/tasks/Dockerfile`, `services/tasks/package.json`
  - Verify: docker compose up --build brings all 5 services to healthy. curl to /api/tasks/lists without auth returns 401. curl with valid cookie returns lists.

- [x] **T05: Frontend lists screen** `est:medium`
  Create Lists page component. After login, navigate to /lists instead of Home. Fetch GET /api/tasks/lists (with credentials). Display list names in a mobile-friendly list. Show loading state. Show error state. Polished touch-friendly UI with Tailwind. Update routing.
  - Files: `services/frontend/src/pages/Lists.tsx`, `services/frontend/src/api/tasks.ts`, `services/frontend/src/App.tsx`, `services/frontend/src/pages/Home.tsx`
  - Verify: Frontend builds clean. After login, user sees Lists screen with Inbox displayed. Mobile-friendly layout verified in browser.

- [x] **T06: E2E test — authenticated user sees Inbox** `est:medium`
  Write a Playwright-style E2E test (or curl-based integration test against Docker stack) that: registers a user, logs in, navigates to lists, and verifies Inbox appears. Screenshot capture of the lists screen.
  - Files: `services/tasks/src/lists.e2e.test.ts`
  - Verify: E2E test passes against running Docker stack. Screenshot captured showing lists screen with Inbox.

## Files Likely Touched

- services/tasks/prisma/schema.prisma
- services/tasks/package.json
- services/tasks/prisma.config.ts
- services/tasks/tsconfig.json
- services/tasks/src/auth.ts
- services/tasks/src/auth.test.ts
- services/tasks/src/lists.ts
- services/tasks/src/lists.test.ts
- services/tasks/src/app.ts
- services/tasks/src/db.ts
- docker-compose.yml
- services/tasks/Dockerfile
- services/frontend/src/pages/Lists.tsx
- services/frontend/src/api/tasks.ts
- services/frontend/src/App.tsx
- services/frontend/src/pages/Home.tsx
- services/tasks/src/lists.e2e.test.ts
