---
id: T02
parent: S21
milestone: M001
key_files:
  - docker-compose.yml
  - playwright.config.ts
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-08T15:28:00.943Z
blocker_discovered: false
---

# T02: Fixed e2e service to use frontend-net and http://frontend:80 instead of network_mode: host

**Fixed e2e service to use frontend-net and http://frontend:80 instead of network_mode: host**

## What Happened

Removed network_mode: host from the e2e service in docker-compose.yml. Added networks: [frontend-net] so the e2e container can reach the frontend container by hostname. Changed BASE_URL env var default from http://localhost:8080 to http://frontend:80. playwright.config.ts already reads from process.env.BASE_URL with http://localhost:8080 as the out-of-Docker fallback — no changes needed there.

## Verification

grep -q 'frontend-net' docker-compose.yml && ! grep -q 'network_mode: host' docker-compose.yml — passes. playwright.config.ts fallback to localhost:8080 confirmed present.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -q 'frontend-net' docker-compose.yml && ! grep -q 'network_mode: host' docker-compose.yml` | 0 | pass | 30ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `docker-compose.yml`
- `playwright.config.ts`
