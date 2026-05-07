---
estimated_steps: 1
estimated_files: 15
skills_used: []
---

# T01: Docker Compose foundation with 5 healthy services

Create docker-compose.yml with all 5 services (frontend/nginx, auth/Express, tasks/Express, auth-db/Postgres, tasks-db/Postgres), 3 networks (frontend-net, auth-net, tasks-net), 2 named volumes. Each service has a health check. Auth and tasks start as minimal Express apps with GET /health returning 200. Frontend is nginx serving a static placeholder.

## Inputs

- `nothing — first task`

## Expected Output

- `docker-compose.yml with 5 services, 3 networks, 2 volumes`
- `Minimal Express health endpoints for auth and tasks services`
- `Nginx placeholder for frontend`
- `All containers healthy on docker compose up`

## Verification

docker compose up -d && sleep 10 && docker compose ps --format json | jq -e 'all(.Health == "healthy" or .State == "running")'
