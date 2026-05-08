---
id: T01
parent: S21
milestone: M001
key_files:
  - docker-compose.yml
  - .env.example
  - tailscale/serve-config.json
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-08T15:27:54.597Z
blocker_discovered: false
---

# T01: Parameterized docker-compose.yml via .env, added Tailscale Funnel service, removed all host port mappings

**Parameterized docker-compose.yml via .env, added Tailscale Funnel service, removed all host port mappings**

## What Happened

Reworked docker-compose.yml to substitute all hardcoded secrets and domain names via ${VAR:-default} env var syntax. Removed all ports: directives from frontend, auth, tasks, auth-db, tasks-db. Added tailscale service using tailscale/tailscale:latest with TS_SERVE_CONFIG pointing to a mounted serve-config.json. Created tailscale/serve-config.json with Funnel routing: / → frontend:80, /webhook → webhook:9000. Added restart: unless-stopped to all persistent services. Updated .env.example with all new vars including TS_AUTHKEY, TS_HOSTNAME, RP_ID, RP_ORIGIN, and WEBHOOK_SECRET.

## Verification

docker compose config --quiet passes (only expected warnings for prod-only vars TS_AUTHKEY and WEBHOOK_SECRET not set in dev). No host port mappings remain. RP_ID and RP_ORIGIN are parameterized. tailscale service present in compose.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -v 'localhost' docker-compose.yml | grep -c '${' && ! grep -n 'ports:' docker-compose.yml | grep -v '#'` | 0 | pass | 50ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `docker-compose.yml`
- `.env.example`
- `tailscale/serve-config.json`
