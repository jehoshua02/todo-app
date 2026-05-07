# S03: Stay logged in — persistent auth with token refresh — UAT

**Milestone:** M001
**Written:** 2026-05-07T07:33:25.692Z

## UAT: S03 — Stay logged in

### Prerequisites
- All services running (`docker compose up`)
- A registered user from S01/S02

### Test Cases

1. **Session persists across page refresh**
   - Login with a registered username
   - See welcome message on Home
   - Refresh the browser page (F5)
   - ✅ Still on Home with welcome message (not redirected to login)

2. **Session persists in new tab**
   - While logged in, open a new tab to /
   - ✅ Shows Home with welcome message

3. **Logout clears session**
   - Click "Sign out" button on Home
   - ✅ Redirected to login page
   - Refresh the page
   - ✅ Stays on login page (session fully cleared)

4. **Login redirects authenticated users**
   - While logged in, navigate to /login
   - ✅ Redirected to Home (already authenticated)

5. **Register redirects authenticated users**
   - While logged in, navigate to /register
   - ✅ Redirected to Home (already authenticated)

6. **Loading state during session check**
   - Clear all cookies, navigate to /
   - ✅ Brief loading indicator while refresh is attempted
   - ✅ Then redirected to login

7. **Registration preserves session**
   - Register a new user
   - See welcome message
   - Refresh page
   - ✅ Still authenticated
