---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T04: Docker integration — add JWT_SECRET to task service, rebuild

Add JWT_SECRET env var to task service in docker-compose.yml. Add cookie-parser and jsonwebtoken dependencies. Update Dockerfile to run prisma migrate deploy on startup. Rebuild and verify all containers come up healthy.

## Inputs

- `Existing docker-compose.yml`

## Expected Output

- `Updated docker-compose.yml with JWT_SECRET on tasks service`
- `Updated Dockerfile with migration step`

## Verification

docker compose up --build brings all 5 services to healthy. curl to /api/tasks/lists without auth returns 401. curl with valid cookie returns lists.
