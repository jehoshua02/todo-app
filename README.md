# Todo App

Task management app with passkey authentication. Built with Vite + React frontend, Express API services, and PostgreSQL.

## Prerequisites

- Docker & Docker Compose

## Quick Start

```bash
cp .env.example .env   # edit as needed
docker compose up --build
```

App runs at `http://localhost` (port 80).

## Running Tests

### Unit Tests (auth, tasks, frontend)

```bash
# All three services
docker compose exec auth npm test
docker compose exec tasks npm test
docker compose exec frontend npm test

# Watch mode
docker compose exec auth npm run test:watch
docker compose exec tasks npm run test:watch
docker compose exec frontend npm run test:watch
```

### E2E Tests

E2E runs via the `e2e` profile against a live Tailscale Funnel URL:

```bash
docker compose --profile e2e up e2e --build
```

Requires `TS_AUTHKEY` and `RP_ORIGIN` set in `.env`.

## Services

| Service | Port (internal) | Description |
|---------|----------------|-------------|
| frontend | 80 | Vite + React SPA served by nginx |
| auth | 3000 | Passkey registration/login, JWT tokens |
| tasks | 3000 | Lists & tasks CRUD |
| auth-db | 5432 | PostgreSQL for auth |
| tasks-db | 5432 | PostgreSQL for tasks |
| deploy | - | Webhook-triggered deploy |
| tailscale | - | Tailscale Funnel ingress |
