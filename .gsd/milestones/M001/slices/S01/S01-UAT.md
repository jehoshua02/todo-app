# S01: User can register — UAT

**Milestone:** M001
**Written:** 2026-05-06T14:17:55.172Z

## UAT: S01 — User can register\n\n### Prerequisites\n- Docker and Docker Compose installed\n- Copy .env.example to .env\n\n### Test Steps\n\n1. **Start all services**\n   ```bash\n   docker compose up -d\n   ```\n   - [ ] All 5 services reach healthy state within 60s\n\n2. **Open registration page**\n   - Navigate to http://localhost:8080\n   - [ ] Registration form visible with username input and Register button\n\n3. **Register a new user**\n   - Enter username, click Register with passkey, complete ceremony\n   - [ ] Success message displayed\n   - [ ] Cookies: access_token and refresh_token (HTTP-only)\n\n4. **Duplicate username rejection**\n   - Register same username again\n   - [ ] Error 409 displayed\n\n5. **Health endpoint**\n   - curl http://localhost:3001/health\n   - [ ] Returns 200
