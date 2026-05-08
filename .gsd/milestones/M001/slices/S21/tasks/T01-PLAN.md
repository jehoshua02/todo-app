---
estimated_steps: 14
estimated_files: 2
skills_used: []
---

# T01: Parameterize compose, add Tailscale Funnel service, remove host ports

Rework docker-compose.yml so all services are configurable via .env and no host ports are published. Add a tailscale service on frontend-net that runs Tailscale Funnel and proxies inbound HTTPS traffic to frontend:80. This enables identical compose files for dev and prod — only the .env differs.

### Steps
1. Add env var substitution for all hardcoded values in docker-compose.yml: DB user/password/name, JWT_SECRET, RP_ID, RP_ORIGIN, auth/tasks ports, Tailscale auth key (TS_AUTHKEY) and hostname (TS_HOSTNAME). Use ${VAR:-default} so dev works without a full .env.
2. Remove all `ports:` directives from every service (frontend, auth, tasks, auth-db, tasks-db). Services communicate only within Docker networks.
3. Add a `tailscale` service: image `tailscale/tailscale:latest`, environment vars TS_AUTHKEY and TS_HOSTNAME, volume `tailscale-state:/var/lib/tailscale`, network `frontend-net`. The service runs `tailscaled` and then `tailscale up --authkey $TS_AUTHKEY --hostname $TS_HOSTNAME --accept-dns=false` followed by `tailscale serve --bg --https=443 http://frontend:80` to enable Funnel proxy.
4. Add `tailscale-state` named volume to the volumes block.
5. Update .env.example with all new vars: TS_AUTHKEY, TS_HOSTNAME, RP_ID, RP_ORIGIN, AUTH_DB_USER, AUTH_DB_PASSWORD, AUTH_DB_NAME, TASKS_DB_USER, TASKS_DB_PASSWORD, TASKS_DB_NAME, JWT_SECRET.
6. Update docker-compose.yml `auth` service environment to use ${RP_ID:-localhost} and ${RP_ORIGIN:-http://localhost:8080} instead of hardcoded values.
7. Update DB connection strings in auth and tasks services to use parameterized vars.

### Must-Haves
- No hardcoded secrets or domain names remain in docker-compose.yml
- tailscale service is on frontend-net only (it only needs to reach frontend)
- All existing services keep their restart policies (or add `restart: unless-stopped` for prod)
- Dev defaults (${VAR:-default}) allow `docker compose up` to work without any .env for local dev that doesn't need Funnel

## Inputs

- ``docker-compose.yml``
- ``.env.example``

## Expected Output

- ``docker-compose.yml``
- ``.env.example``

## Verification

grep -v 'localhost\|auth_pass\|tasks_pass\|dev-secret' docker-compose.yml | grep -c '${' || true
