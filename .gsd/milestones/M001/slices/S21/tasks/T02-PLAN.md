---
estimated_steps: 9
estimated_files: 2
skills_used: []
---

# T02: Fix e2e service networking after host port removal

The e2e service currently uses `network_mode: host` and connects to `http://localhost:8080`. With host ports removed, it must join `frontend-net` and connect to `http://frontend:80` directly. Update the e2e service and Playwright config accordingly.

### Steps
1. In docker-compose.yml, remove `network_mode: host` from the e2e service and add `networks: [frontend-net]`.
2. Change the e2e service `BASE_URL` environment variable default to `http://frontend:80`.
3. In playwright.config.ts (or wherever BASE_URL is consumed), ensure it reads from `process.env.BASE_URL` with a fallback of `http://localhost:8080` for running tests outside Docker.
4. Verify the e2e Dockerfile doesn't bind to host networking in any other way.

### Must-Haves
- `docker compose --profile e2e up` still runs all 28 tests successfully
- Tests can still be run outside Docker (e.g. `npx playwright test`) using the localhost fallback

## Inputs

- ``docker-compose.yml``
- ``playwright.config.ts``
- ``e2e/auth-flow.spec.ts``

## Expected Output

- ``docker-compose.yml``
- ``playwright.config.ts``

## Verification

grep -q 'frontend-net' docker-compose.yml && ! grep -q 'network_mode: host' docker-compose.yml
