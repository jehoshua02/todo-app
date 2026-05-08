---
id: T04
parent: S21
milestone: M001
key_files:
  - services/webhook/server.mjs
  - services/webhook/Dockerfile
  - docker-compose.yml
  - .env.example
  - DEPLOYMENT.md
  - tailscale/serve-config.json
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-08T15:28:17.645Z
blocker_discovered: false
---

# T04: Built webhook server with HMAC-SHA256 validation, Dockerfile, and wired into docker-compose.yml + tailscale serve config

**Built webhook server with HMAC-SHA256 validation, Dockerfile, and wired into docker-compose.yml + tailscale serve config**

## What Happened

Created services/webhook/server.mjs: Node.js HTTP server on port 9000. POST /webhook reads raw body, computes HMAC-SHA256 with WEBHOOK_SECRET, compares to X-Hub-Signature-256 header using timingSafeEqual. Returns 401 on invalid signature, 200 on valid. On push to refs/heads/main, spawns scripts/deploy.sh detached with output logged to ~/deploy-logs/. Never logs the secret. Created services/webhook/Dockerfile: node:22-alpine, copies server.mjs, exposes 9000. Added webhook service to docker-compose.yml on frontend-net with scripts/ volume mounted read-only. Updated tailscale depends_on to include webhook:service_started. tailscale/serve-config.json already routes /webhook → webhook:9000. Added WEBHOOK_SECRET to .env.example. Added GitHub Webhook Setup section to DEPLOYMENT.md.

## Verification

test -f services/webhook/server.mjs && test -f services/webhook/Dockerfile && grep -q 'timingSafeEqual' services/webhook/server.mjs && grep -q 'webhook' docker-compose.yml — all pass. docker compose config --quiet passes.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `test -f services/webhook/server.mjs && test -f services/webhook/Dockerfile && grep -q 'timingSafeEqual' services/webhook/server.mjs && grep -q 'webhook' docker-compose.yml` | 0 | pass | 30ms |
| 2 | `docker compose config --quiet` | 0 | pass — only expected warnings for prod-only vars | 500ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `services/webhook/server.mjs`
- `services/webhook/Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `DEPLOYMENT.md`
- `tailscale/serve-config.json`
