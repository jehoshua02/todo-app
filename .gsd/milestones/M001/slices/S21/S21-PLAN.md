# S21: Tailscale Funnel + prod deployment

**Goal:** Make the app deployable to any environment via a single .env file, served over HTTPS through Tailscale Funnel with no host port conflicts. Add a GitHub webhook endpoint so merging to main auto-deploys to prod.
**Demo:** App served over HTTPS via Tailscale Funnel. Passkey auth works on Android Chrome. Clone repo, drop .env, compose up — that's a deployment. WSL stays up after Windows reboot.

## Must-Haves

- `docker compose up -d` with a prod .env brings up all services with no host ports published
- App is reachable over HTTPS at the Tailscale Funnel domain
- Passkey auth works on Android Chrome against the Funnel domain
- Merging a PR to main triggers the webhook, which runs `scripts/deploy.sh` in the prod clone
- WSL starts automatically after Windows reboot via NSSM Windows service
- E2E tests still pass after networking changes

## Proof Level

- This slice proves: integration + operational — real runtime required; human UAT required for Android Chrome passkey verification

## Integration Closure

Upstream: docker-compose.yml, services/frontend/nginx.conf, e2e/auth-flow.spec.ts, .env.example. New wiring: tailscale sidecar on frontend-net, webhook server container on frontend-net, parameterized RP_ID/RP_ORIGIN, no host ports. What remains: S18/S19 code reorg, S20 UX audit, S17 theme picker.

## Verification

- Webhook server logs deploy trigger events with timestamp and HMAC validation result. Tailscale container logs Funnel status. Deploy script logs stdout/stderr of docker compose to a dated log file in ~/deploy-logs/.

## Tasks

- [x] **T01: Parameterize compose, add Tailscale Funnel service, remove host ports** `est:1h`
  Rework docker-compose.yml so all services are configurable via .env and no host ports are published. Add a tailscale service on frontend-net that runs Tailscale Funnel and proxies inbound HTTPS traffic to frontend:80. This enables identical compose files for dev and prod — only the .env differs.
  - Files: ``docker-compose.yml``, ``.env.example``
  - Verify: grep -v 'localhost\|auth_pass\|tasks_pass\|dev-secret' docker-compose.yml | grep -c '${' || true

- [x] **T02: Fix e2e service networking after host port removal** `est:30m`
  The e2e service currently uses `network_mode: host` and connects to `http://localhost:8080`. With host ports removed, it must join `frontend-net` and connect to `http://frontend:80` directly. Update the e2e service and Playwright config accordingly.
  - Files: ``docker-compose.yml``, ``playwright.config.ts``
  - Verify: grep -q 'frontend-net' docker-compose.yml && ! grep -q 'network_mode: host' docker-compose.yml

- [x] **T03: Add deploy script, NSSM WSL autostart, and deployment docs** `est:45m`
  Create a `scripts/deploy.sh` that pulls latest and runs `docker compose up -d --build` in the prod clone. Document how to set up the prod clone, configure NSSM to start WSL at Windows boot, and perform the first deploy.
  - Files: ``scripts/deploy.sh``, ``DEPLOYMENT.md``
  - Verify: test -f scripts/deploy.sh && test -x scripts/deploy.sh && test -f DEPLOYMENT.md && grep -c '^## ' DEPLOYMENT.md | grep -qE '[3-9]|[0-9]{2}'

- [x] **T04: Build webhook server for GitHub-triggered auto-deploy** `est:1h`
  Add a lightweight Node.js webhook server container that listens for GitHub push-to-main events, validates the HMAC-SHA256 signature using a shared secret, and runs scripts/deploy.sh. This closes the auto-deploy loop: merge PR → GitHub fires webhook → server validates + runs deploy script.
  - Files: ``services/webhook/server.mjs``, ``services/webhook/Dockerfile``, ``docker-compose.yml``, ``.env.example``, ``DEPLOYMENT.md``
  - Verify: test -f services/webhook/server.mjs && test -f services/webhook/Dockerfile && grep -q 'timingSafeEqual' services/webhook/server.mjs && grep -q 'webhook' docker-compose.yml

## Files Likely Touched

- `docker-compose.yml`
- `.env.example`
- `playwright.config.ts`
- `scripts/deploy.sh`
- `DEPLOYMENT.md`
- `services/webhook/server.mjs`
- `services/webhook/Dockerfile`
