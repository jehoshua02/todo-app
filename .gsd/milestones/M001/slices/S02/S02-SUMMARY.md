---
id: S02
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - services/auth/src/login.ts
  - services/auth/src/login.test.ts
  - services/frontend/src/pages/Login.tsx
  - services/frontend/src/pages/Home.tsx
  - services/frontend/src/App.tsx
key_decisions:
  - Location.state for auth is intentionally temporary — S03 replaces it with persistent cookie-based auth
  - Home.tsx serves as the protected route for both login and registration entry points
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-07T07:23:49.560Z
blocker_discovered: false
---

# S02: User can login

**Full login flow — WebAuthn assertion backend, frontend login page, and authenticated state display**

## What Happened

S02 delivers the complete login vertical slice. The backend exposes POST /api/auth/login (challenge generation) and POST /api/auth/login/verify (WebAuthn assertion verification + cookie issuance). The frontend Login.tsx page collects the username, triggers the browser's WebAuthn ceremony, and on success navigates to Home.tsx which displays the authenticated user's welcome message. Both login and registration flows converge on the same Home component. Auth state is passed via location.state — intentionally ephemeral, to be replaced by persistent cookie-based auth in S03.

## Verification

Integration tests pass for all login endpoint scenarios (missing username, unregistered user, invalid assertion, happy path with cookie verification). Browser verification confirms end-to-end login flow and authenticated state display.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

S03 replaces location.state auth with persistent cookie-based auth — refresh endpoint already exists, frontend interceptor and auth state management remain.

## Files Created/Modified

- `services/auth/src/login.ts` — Login endpoints with WebAuthn assertion
- `services/auth/src/login.test.ts` — Integration tests for login endpoints
- `services/frontend/src/pages/Login.tsx` — Login page with WebAuthn client ceremony
- `services/frontend/src/pages/Home.tsx` — Authenticated state display
- `services/frontend/src/App.tsx` — Client-side routing setup
- `services/frontend/src/api/auth.ts` — Frontend auth API with login function
