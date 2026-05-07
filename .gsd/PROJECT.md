# Task App

## What This Is

A multi-tenant web-based task list application with passkey (WebAuthn) authentication. Users register and log in with passkeys, manage multiple named lists, and organize tasks with titles, descriptions, and due dates. Three-screen drill-down mobile-first UI (Lists → List → Task). Fully containerized with Docker Compose — separate auth service, task service, and dedicated Postgres instances per service.

Currently: empty project, planning complete, no code written yet.

## Core Value

Authenticated users can create, organize, and manage tasks across multiple lists with a polished mobile-first experience — all running from a single `docker compose up`.

## Project Shape

- **Complexity:** complex
- **Why:** Passkey auth (WebAuthn challenge/response), JWT + refresh token rotation, separate auth/task services with independent databases, mobile-first polished UI, full testing pyramid including Playwright E2E.

## Current State

Empty project. Only a `.gitignore` exists. All infrastructure, services, and UI need to be built from scratch.

## Architecture / Key Patterns

- **Frontend:** React + Vite + TypeScript + Tailwind CSS, served by nginx container
- **Auth Service:** Node/Express/TypeScript, `@simplewebauthn/server`, owns users + credentials + refresh tokens
- **Task Service:** Node/Express/TypeScript, Prisma ORM, owns lists + tasks
- **Auth-DB:** Dedicated Postgres instance for auth service (volume-mounted)
- **Tasks-DB:** Dedicated Postgres instance for task service (volume-mounted)
- **JWT:** HS256 shared secret, 15-min access tokens, longer-lived refresh tokens (DB-backed, revocable)
- **Data isolation:** Every task service query scoped by `user_id` from verified JWT claim
- **Navigation:** Three-screen drill-down (Lists → List → Task), full-screen views with back navigation
- **Testing:** Unit → Integration → E2E (Playwright with screenshots on every screen)
- **Docker Compose:** 5 services (frontend, auth, tasks, auth-db, tasks-db) with 3 isolated networks:
  - `frontend-net`: frontend ↔ auth, tasks (frontend can reach API services only)
  - `auth-net`: auth ↔ auth-db (only auth can reach auth-db)
  - `tasks-net`: tasks ↔ tasks-db (only tasks can reach tasks-db)

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: Full-Stack Task App — Passkey auth, lists/tasks CRUD, mobile-first UI, Dockerized with E2E tests
