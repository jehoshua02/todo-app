---
id: T04
parent: S04
milestone: M001
key_files:
  - docker-compose.yml
  - services/tasks/Dockerfile
  - services/tasks/package.json
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-07T10:30:42.072Z
blocker_discovered: false
---

# T04: Docker integration — JWT_SECRET, cookie-parser, prisma migrate deploy on startup

**Docker integration — JWT_SECRET, cookie-parser, prisma migrate deploy on startup**

## What Happened

Added JWT_SECRET env var to task service in docker-compose.yml. Added cookie-parser and jsonwebtoken dependencies. Updated Dockerfile to run prisma migrate deploy on startup. All 5 containers come up healthy.

## Verification

docker compose up --build brings all services to healthy. Unauthenticated requests return 401, authenticated requests return lists.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `docker compose up --build -d` | 0 | pass | 30000ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `docker-compose.yml`
- `services/tasks/Dockerfile`
- `services/tasks/package.json`
