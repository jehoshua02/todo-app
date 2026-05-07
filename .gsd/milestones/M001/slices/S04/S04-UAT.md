# S04: User can see their lists (task service bootstrap + Inbox) — UAT

**Milestone:** M001
**Written:** 2026-05-07T10:31:05.393Z

## UAT: S04 — User can see their lists

### Scenario 1: New user sees Inbox after registration
1. Navigate to /register
2. Register with new credentials
3. **Verify:** Redirected to /lists showing "Inbox" list item

### Scenario 2: Returning user sees lists after login
1. Navigate to /login
2. Login with existing credentials
3. **Verify:** Redirected to /lists showing user's lists including Inbox

### Scenario 3: Unauthenticated access rejected
1. Navigate to /lists without logging in
2. **Verify:** Redirected to /login

### Scenario 4: User isolation
1. Register two different users
2. **Verify:** Each user sees only their own Inbox, not the other's
