---
verdict: needs-remediation
remediation_round: 0
---

# Milestone Validation: M001

## Success Criteria Checklist
- [ ] **A new user can register, log in, create a list, add a task, complete it, confirm it disappears — via Playwright** | FAIL — No Playwright tests exist. Lists/tasks CRUD not implemented. Tasks service is a health-endpoint stub.
- [ ] **A second user registers and cannot see the first user's data** | FAIL — No data isolation test. No list/task API exists.
- [ ] **Token refresh works transparently** | PARTIAL — Refresh endpoint exists and tested. AuthContext calls refresh on mount. But no 401-intercept/retry mechanism for mid-session transparent refresh.
- [ ] **Deleting a list moves its tasks to Inbox** | FAIL — Lists and tasks CRUD do not exist in either service.

## Slice Delivery Audit
### S02 — User can login
- SUMMARY.md: Present ✓
- ASSESSMENT.md: Present, verdict: roadmap-adjusted ✓
- Verification: Integration tests pass for login endpoints ✓
- Status: **Delivered**

### S03 — Stay logged in
- SUMMARY.md: Present ✓
- ASSESSMENT.md: Not found (no S03-ASSESSMENT.md)
- Verification: 44 tests pass (37 backend, 7 frontend) ✓
- Status: **Delivered**

### Missing Slices
The roadmap only lists S02 and S03. The original M001-CONTEXT.md describes a full-stack task app requiring lists CRUD, tasks CRUD, mobile-first UI, and E2E Playwright tests. These capabilities were never planned as slices on the roadmap:
- No slice for Docker infrastructure setup (R001, R012, R013 happen to be covered by existing docker-compose.yml)
- No slice for task service API (R004, R005, R006, R007, R008, R009, R010)
- No slice for mobile-first UI (R011)
- No slice for E2E Playwright tests (R014, R015)
- No slice for auth service standalone verification (R016)

## Cross-Slice Integration
### S02 → S03 Integration

| Boundary | Producer | Consumer | Status |
|---|---|---|---|
| location.state → useAuth() | S02 (ephemeral auth) | S03 (AuthContext) | PASS |
| AuthProvider wraps routes | S03 (AuthContext.tsx) | App.tsx | PASS |
| Login sets cookies → refresh reads them | S02 (login.ts setTokenCookies) | S03 (refresh-on-mount) | PASS |
| Cookie path covers refresh + logout | cookies.ts (path: /api/auth/) | refresh.ts, logout.ts | PASS |
| logout revokes token + clears cookies | S03 (logout.ts) | Home.tsx handleLogout | PASS |
| No stale location.state references | S02 (removed) | — | PASS |

**Cross-slice integration between S02 and S03 is clean.** S03 properly consumed and replaced all S02 boundaries.

**However**, there is no cross-slice integration evidence for the broader milestone because the task domain slices (lists, tasks, data isolation, UI) were never built. The auth system integrates with itself but has no downstream consumer (task service) to validate the JWT-based cross-service auth pattern.

## Requirement Coverage
| Requirement | Status | Evidence |
|---|---|---|
| R001: Docker Compose network segmentation | COVERED | docker-compose.yml defines 3 networks with correct isolation |
| R002: Passkey auth (register + login) | COVERED | Full WebAuthn flows in auth service + frontend |
| R003: JWT access + refresh token flow | COVERED | 15m access tokens, DB-backed revocable refresh tokens, rotation |
| R004: Per-user data isolation | MISSING | Tasks service has only health endpoint, no JWT middleware |
| R005: Multiple named lists per user | MISSING | No list model, routes, or UI |
| R006: Inbox system list | MISSING | No Inbox concept anywhere |
| R007: Task CRUD | MISSING | No task model, routes, or UI |
| R008: Completed tasks hidden from view | MISSING | No task filtering logic |
| R009: List management | MISSING | No list management routes or UI |
| R010: Orphaned tasks → Inbox | MISSING | No orphan handling logic |
| R011: Mobile-first 3-screen drill-down | PARTIAL | Tailwind mobile layout exists but only auth screens, no Lists→List→Task |
| R012: Docker Compose 5 services | COVERED | All 5 services declared with healthchecks |
| R013: Separate Postgres per service | COVERED | auth-db and tasks-db are distinct containers |
| R014: Full testing pyramid | PARTIAL | Unit + integration tests for auth; no E2E/Playwright |
| R015: Playwright E2E screenshots | MISSING | No Playwright infrastructure |
| R016: Auth as standalone service | PARTIAL | Auth standalone works; tasks service doesn't verify JWT |
| R017: No unsupported browser fallback | MISSING | No browser detection gate |

**Summary:** 4 COVERED, 3 PARTIAL, 10 MISSING out of 17 active requirements. The milestone delivered authentication only — the entire task/list domain is unbuilt.

## Verification Class Compliance
| Class | Planned Check | Evidence | Verdict |
|---|---|---|---|
| Contract | Unit + integration tests pass for both backend services | Auth: 37 tests pass across 6 files. Frontend: 7 tests pass. Tasks service: no tests, only health stub. | PARTIAL |
| Integration | Playwright E2E passes against full Docker stack | No Playwright config, no E2E tests exist anywhere. | FAIL |
| Operational | `docker compose up` brings all 5 services healthy | 4/5 healthy. Frontend healthcheck fails due to IPv6/IPv4 mismatch in Alpine wget. | FAIL |
| UAT | End-to-end user flows (register → list → task → complete) | Only auth flows exist. No list/task flows possible. | FAIL |


## Verdict Rationale
The milestone delivered only authentication (S02: login, S03: persistent auth). 10 of 17 requirements are MISSING — the entire task/list domain (CRUD, Inbox, data isolation, mobile UI) was never built. 0 of 4 acceptance criteria are met. All three verification classes beyond Contract are FAIL. The roadmap only planned 2 slices (S02, S03) but the milestone scope requires at minimum: task service API with lists/tasks CRUD, mobile-first frontend UI, E2E Playwright tests, and a frontend Docker healthcheck fix. Remediation slices are needed for all unbuilt capabilities.

## Remediation Plan
The following remediation slices are needed to complete M001:

1. **Task Service API** — Implement lists CRUD, tasks CRUD, Inbox system list, orphan handling, per-user data isolation via JWT middleware. Covers R004, R005, R006, R007, R008, R009, R010.

2. **Mobile-First Frontend UI** — Three-screen drill-down (Lists → List → Task), touch-friendly targets, smooth transitions. Wire to task service API. Covers R011.

3. **Auth Hardening** — Add unsupported browser detection gate (R017), verify task service JWT consumption (R016), add 401-intercept for transparent token refresh (R003 full coverage).

4. **E2E Testing & Operational** — Playwright test infrastructure, E2E tests covering all acceptance criteria with screenshots, fix frontend Docker healthcheck IPv6 issue. Covers R014, R015, and Operational verification class.

5. **Frontend Docker Healthcheck Fix** — Change wget to use IPv4 or switch to curl to resolve Alpine IPv6 mismatch.
