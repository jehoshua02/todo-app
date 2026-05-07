# S02: User can login — UAT

**Milestone:** M001
**Written:** 2026-05-07T07:23:49.560Z

## UAT: S02 — User can login

### Prerequisites
- Auth service running (`docker compose up`)
- A user previously registered via the registration flow

### Test Cases

1. **Happy path login**
   - Navigate to /login
   - Enter registered username
   - Complete WebAuthn assertion ceremony
   - ✅ Redirected to Home with welcome message showing username

2. **Login with unregistered username**
   - Navigate to /login
   - Enter a username that hasn't registered
   - ✅ Error message displayed (404 — user not found)

3. **Cancel WebAuthn ceremony**
   - Navigate to /login
   - Enter registered username
   - Cancel the browser's WebAuthn prompt
   - ✅ Error message displayed, remains on login page

4. **Navigation from registration**
   - Complete registration flow
   - ✅ Also lands on Home with welcome message

5. **Unauthenticated access**
   - Navigate directly to /
   - ✅ Redirected to /login
