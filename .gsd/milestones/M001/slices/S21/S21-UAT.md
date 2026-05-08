# S21: Tailscale Funnel + prod deployment — UAT

**Milestone:** M001
**Written:** 2026-05-08T15:28:36.991Z

# S21 UAT: Tailscale Funnel + Prod Deployment

## Setup

1. Configure `.env` with real `TS_AUTHKEY`, `TS_HOSTNAME`, `RP_ID`, `RP_ORIGIN`, `JWT_SECRET`, `WEBHOOK_SECRET`
2. Ensure HTTPS certificates and Funnel are enabled in Tailscale admin console
3. Run `docker compose up -d --build`

## Tests

- [ ] `docker compose ps` shows all services healthy (frontend, auth, tasks, auth-db, tasks-db, tailscale, webhook)
- [ ] `docker compose logs tailscale` shows Funnel active on port 443
- [ ] App loads at `https://<hostname>.tail<net>.ts.net` in browser
- [ ] Passkey registration works on Android Chrome at the `.ts.net` domain
- [ ] Passkey login works on Android Chrome
- [ ] Task CRUD works end-to-end on mobile
- [ ] GitHub webhook fires on push to main → `docker compose logs webhook` shows deploy triggered
- [ ] `scripts/deploy.sh` can be run manually and completes successfully with log in `~/deploy-logs/`
- [ ] After Windows reboot with NSSM configured, app is reachable within ~60s without manual intervention

