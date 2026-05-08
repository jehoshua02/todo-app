---
id: S21
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - docker-compose.yml
  - .env.example
  - tailscale/serve-config.json
  - scripts/deploy.sh
  - DEPLOYMENT.md
  - services/webhook/server.mjs
  - services/webhook/Dockerfile
key_decisions:
  - (none)
patterns_established:
  - Deploy pattern: clone repo + drop .env + scripts/deploy.sh = complete deployment to any environment
  - Tailscale Funnel via TS_SERVE_CONFIG JSON for multi-path HTTPS routing in Docker Compose
  - Webhook HMAC validation with timingSafeEqual — never log the secret, respond 200 before async deploy completes
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-08T15:28:36.991Z
blocker_discovered: false
---

# S21: Tailscale Funnel + prod deployment

**Deployable via .env swap + Tailscale Funnel, with GitHub webhook auto-deploy and NSSM WSL autostart**

## What Happened

Reworked the entire compose stack to be environment-driven: all secrets, DB credentials, and WebAuthn domain vars come from .env with safe dev defaults. Removed all host port mappings — services communicate only within Docker networks. Added tailscale service using TS_SERVE_CONFIG to route / → frontend:80 and /webhook → webhook:9000 with Funnel enabled for public HTTPS. Fixed e2e service to join frontend-net and use http://frontend:80 instead of network_mode: host. Added scripts/deploy.sh for idempotent deploys with dated log output. Created DEPLOYMENT.md covering first deploy, NSSM WSL autostart on Windows, manual deploy, and GitHub webhook setup. Built services/webhook/server.mjs: HMAC-SHA256 validated, push-to-main triggered, async deploy execution, never logs the secret.

## Verification

docker compose config --quiet passes (expected dev warnings only). All files exist and are correctly wired. No host ports remain. Tailscale, webhook, and e2e services all properly networked.

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

None.

## Files Created/Modified

- `docker-compose.yml` — Parameterized all env vars, removed host ports, added tailscale and webhook services, fixed e2e networking
- `.env.example` — Added TS_AUTHKEY, TS_HOSTNAME, RP_ID, RP_ORIGIN, WEBHOOK_SECRET
- `tailscale/serve-config.json` — Tailscale Funnel serve config routing / and /webhook
- `scripts/deploy.sh` — Idempotent deploy script with dated log output
- `DEPLOYMENT.md` — End-to-end deployment guide: first deploy, NSSM WSL autostart, GitHub webhook setup, troubleshooting
- `services/webhook/server.mjs` — GitHub webhook server with HMAC-SHA256 validation and async deploy trigger
- `services/webhook/Dockerfile` — node:22-alpine image for webhook server
