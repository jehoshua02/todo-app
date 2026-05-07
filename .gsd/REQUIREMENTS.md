# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R001 — Docker Compose network segmentation: three isolated networks (frontend-net, auth-net, tasks-net). Frontend can only reach auth and task services. Databases are only reachable by their owning service. No direct frontend-to-database or cross-database access.
- Class: compliance/security
- Status: active
- Description: Docker Compose network segmentation: three isolated networks (frontend-net, auth-net, tasks-net). Frontend can only reach auth and task services. Databases are only reachable by their owning service. No direct frontend-to-database or cross-database access.
- Why it matters: Enforces service boundaries at the network layer. Prevents accidental or malicious direct database access from the frontend container. Defense in depth alongside per-service DB isolation.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: unmapped
- Notes: frontend-net: frontend, auth, tasks. auth-net: auth, auth-db. tasks-net: tasks, tasks-db.

### R002 — Passkey authentication (register + login) via WebAuthn. No password fallback.
- Class: core-capability
- Status: active
- Description: Passkey authentication (register + login) via WebAuthn. No password fallback.
- Why it matters: Primary authentication mechanism. Without it, no user can access the app.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Supported browsers only. No graceful degradation for unsupported browsers.

### R003 — JWT access token (15 min) + refresh token flow. Refresh tokens are DB-backed and revocable. Token refresh is transparent to the user.
- Class: core-capability
- Status: active
- Description: JWT access token (15 min) + refresh token flow. Refresh tokens are DB-backed and revocable. Token refresh is transparent to the user.
- Why it matters: Enables cross-service authentication without inter-service calls on every request.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S04
- Validation: unmapped
- Notes: HS256 shared secret. Upgrade path to RS256/JWKS exists for future third-party services.

### R004 — Per-user data isolation. Every data query scoped by user_id from JWT claims. No user can access another user's data.
- Class: compliance/security
- Status: active
- Description: Per-user data isolation. Every data query scoped by user_id from JWT claims. No user can access another user's data.
- Why it matters: Fundamental security requirement for multi-tenant application.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S03, M001/S05
- Validation: unmapped
- Notes: Enforced at query level. No route accepts user_id from client.

### R005 — Multiple named lists per user to organize their tasks.
- Class: primary-user-loop
- Status: active
- Description: Multiple named lists per user to organize their tasks.
- Why it matters: Core organizational unit. Without lists, tasks are an undifferentiated pile.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S04
- Validation: unmapped

### R006 — Inbox system list — cannot be deleted or renamed. Orphaned tasks from deleted lists move here.
- Class: core-capability
- Status: active
- Description: Inbox system list — cannot be deleted or renamed. Orphaned tasks from deleted lists move here.
- Why it matters: Ensures no task is ever lost when a list is deleted. Provides a default landing spot.
- Source: user
- Primary owning slice: M001/S02
- Validation: unmapped
- Notes: Created automatically on user registration.

### R007 — Task CRUD: title, description, due date, completion status. Sort by due date ascending then creation order.
- Class: primary-user-loop
- Status: active
- Description: Task CRUD: title, description, due date, completion status. Sort by due date ascending then creation order.
- Why it matters: Core value loop — managing individual task items.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S04
- Validation: unmapped

### R008 — Completed tasks hidden from default list view. Not deleted, just filtered out.
- Class: primary-user-loop
- Status: active
- Description: Completed tasks hidden from default list view. Not deleted, just filtered out.
- Why it matters: Keeps the active view focused on what needs to be done.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S04
- Validation: unmapped
- Notes: Toggle to show completed tasks is deferred.

### R009 — List management: rename, delete, reorder. Inbox excluded from rename/delete.
- Class: primary-user-loop
- Status: active
- Description: List management: rename, delete, reorder. Inbox excluded from rename/delete.
- Why it matters: Users need control over their organizational structure.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S04
- Validation: unmapped

### R010 — Orphaned tasks move to Inbox when their parent list is deleted.
- Class: continuity
- Status: active
- Description: Orphaned tasks move to Inbox when their parent list is deleted.
- Why it matters: Prevents accidental data loss. Users won't lose their tasks by deleting a list.
- Source: user
- Primary owning slice: M001/S02
- Validation: unmapped

### R011 — Mobile-first polished UI with three-screen drill-down (Lists → List → Task). Touch-friendly targets (min 44px), smooth transitions, clean typography.
- Class: primary-user-loop
- Status: active
- Description: Mobile-first polished UI with three-screen drill-down (Lists → List → Task). Touch-friendly targets (min 44px), smooth transitions, clean typography.
- Why it matters: The product's usability on mobile is the primary interaction mode.
- Source: user
- Primary owning slice: M001/S04
- Validation: unmapped
- Notes: Polished but simple — not flashy.

### R012 — Docker Compose with 5 services: frontend (nginx), auth (Express), tasks (Express), auth-db (Postgres), tasks-db (Postgres). All come up with docker compose up.
- Class: operability
- Status: active
- Description: Docker Compose with 5 services: frontend (nginx), auth (Express), tasks (Express), auth-db (Postgres), tasks-db (Postgres). All come up with docker compose up.
- Why it matters: Single command to run the entire application. Reproducible environments.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S02, M001/S03, M001/S04
- Validation: unmapped
- Notes: Multi-stage builds for Node services. Named volumes for both Postgres instances.

### R013 — Separate Postgres instance per service. No shared database. No cross-DB foreign keys.
- Class: constraint
- Status: active
- Description: Separate Postgres instance per service. No shared database. No cross-DB foreign keys.
- Why it matters: Forces clean service boundaries at the data layer. SRP applied to infrastructure.
- Source: user
- Primary owning slice: M001/S01
- Validation: unmapped
- Notes: Services communicate only via JWT claims.

### R014 — Full testing pyramid: unit tests for pure logic, integration tests for service + DB, E2E Playwright tests against the full Docker stack.
- Class: quality-attribute
- Status: active
- Description: Full testing pyramid: unit tests for pure logic, integration tests for service + DB, E2E Playwright tests against the full Docker stack.
- Why it matters: Honest verification at every level — not just one layer.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: M001/S01, M001/S02, M001/S03
- Validation: unmapped
- Notes: Unit and integration tests written alongside each service slice. E2E in final slice.

### R015 — Playwright E2E tests capture screenshots of every screen (Lists, List, Task detail, auth flows).
- Class: quality-attribute
- Status: active
- Description: Playwright E2E tests capture screenshots of every screen (Lists, List, Task detail, auth flows).
- Why it matters: Visual regression baseline. Proof of UI polish without manual inspection.
- Source: user
- Primary owning slice: M001/S05
- Validation: unmapped

### R016 — Auth service as independent standalone service. Task service never calls auth service at runtime — only verifies JWT signature.
- Class: constraint
- Status: active
- Description: Auth service as independent standalone service. Task service never calls auth service at runtime — only verifies JWT signature.
- Why it matters: Future multi-service expansion — user authenticates once, all services trust the JWT.
- Source: user
- Primary owning slice: M001/S01
- Validation: unmapped

### R017 — No fallback for unsupported browsers. If browser doesn't support WebAuthn, user cannot use the app.
- Class: constraint
- Status: active
- Description: No fallback for unsupported browsers. If browser doesn't support WebAuthn, user cannot use the app.
- Why it matters: Simplifies auth implementation. Clear product decision — modern browsers only.
- Source: user
- Primary owning slice: M001/S01
- Validation: unmapped

## Validated

## Deferred

### R018 — Drag-and-drop reordering for tasks and lists.
- Class: primary-user-loop
- Status: deferred
- Description: Drag-and-drop reordering for tasks and lists.
- Why it matters: Natural touch gesture for prioritization on mobile.
- Source: user
- Validation: unmapped
- Notes: Deferred to future phase. Position field exists but no DnD UI.

### R019 — Rich notes/comments attached to individual tasks.
- Class: primary-user-loop
- Status: deferred
- Description: Rich notes/comments attached to individual tasks.
- Why it matters: Extended context beyond title and description.
- Source: user
- Validation: unmapped
- Notes: Comes later per user direction.

### R020 — Toggle on list screen to reveal completed (hidden) tasks.
- Class: primary-user-loop
- Status: deferred
- Description: Toggle on list screen to reveal completed (hidden) tasks.
- Why it matters: Users need to occasionally review what they've done.
- Source: user
- Validation: unmapped
- Notes: Completed tasks are stored, just not shown in default view.

## Out of Scope

### R021 — No shared lists, no invitations, no collaborative editing.
- Class: anti-feature
- Status: out-of-scope
- Description: No shared lists, no invitations, no collaborative editing.
- Why it matters: Prevents scope creep into real-time sync, permissions, conflict resolution.
- Source: user
- Validation: n/a

### R022 — No tagging system, no search, no dark mode, no offline/PWA support.
- Class: anti-feature
- Status: out-of-scope
- Description: No tagging system, no search, no dark mode, no offline/PWA support.
- Why it matters: Keeps the product focused on core CRUD + organization.
- Source: user
- Validation: n/a

### R023 — No password-based auth fallback. Passkeys only.
- Class: anti-feature
- Status: out-of-scope
- Description: No password-based auth fallback. Passkeys only.
- Why it matters: Prevents dual auth paths, reduces attack surface, simplifies UX.
- Source: user
- Validation: n/a

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | compliance/security | active | M001/S01 | none | unmapped |
| R002 | core-capability | active | M001/S01 | none | unmapped |
| R003 | core-capability | active | M001/S01 | M001/S04 | unmapped |
| R004 | compliance/security | active | M001/S02 | M001/S03, M001/S05 | unmapped |
| R005 | primary-user-loop | active | M001/S02 | M001/S04 | unmapped |
| R006 | core-capability | active | M001/S02 | none | unmapped |
| R007 | primary-user-loop | active | M001/S03 | M001/S04 | unmapped |
| R008 | primary-user-loop | active | M001/S03 | M001/S04 | unmapped |
| R009 | primary-user-loop | active | M001/S02 | M001/S04 | unmapped |
| R010 | continuity | active | M001/S02 | none | unmapped |
| R011 | primary-user-loop | active | M001/S04 | none | unmapped |
| R012 | operability | active | M001/S01 | M001/S02, M001/S03, M001/S04 | unmapped |
| R013 | constraint | active | M001/S01 | none | unmapped |
| R014 | quality-attribute | active | M001/S05 | M001/S01, M001/S02, M001/S03 | unmapped |
| R015 | quality-attribute | active | M001/S05 | none | unmapped |
| R016 | constraint | active | M001/S01 | none | unmapped |
| R017 | constraint | active | M001/S01 | none | unmapped |
| R018 | primary-user-loop | deferred | none | none | unmapped |
| R019 | primary-user-loop | deferred | none | none | unmapped |
| R020 | primary-user-loop | deferred | none | none | unmapped |
| R021 | anti-feature | out-of-scope | none | none | n/a |
| R022 | anti-feature | out-of-scope | none | none | n/a |
| R023 | anti-feature | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 17
- Mapped to slices: 17
- Validated: 0
- Unmapped active requirements: 0
