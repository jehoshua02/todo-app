---
estimated_steps: 14
estimated_files: 5
skills_used: []
---

# T04: Build webhook server for GitHub-triggered auto-deploy

Add a lightweight Node.js webhook server container that listens for GitHub push-to-main events, validates the HMAC-SHA256 signature using a shared secret, and runs scripts/deploy.sh. This closes the auto-deploy loop: merge PR → GitHub fires webhook → server validates + runs deploy script.

### Steps
1. Create `services/webhook/server.mjs`: HTTP server on port 9000, POST /webhook endpoint. Read raw body, compute HMAC-SHA256 with WEBHOOK_SECRET env var, compare to X-Hub-Signature-256 header (use timingSafeEqual). On signature match and event type `push` to ref `refs/heads/main`, spawn `scripts/deploy.sh` (path relative to project root) with stdout/stderr piped to a log file. Respond 200 immediately (don't await deploy). Log all events with timestamp, event type, ref, and validation result (pass/fail — never log the secret).
2. Create `services/webhook/Dockerfile`: FROM node:22-alpine, WORKDIR /app, COPY server.mjs ., EXPOSE 9000, CMD ["node", "server.mjs"].
3. Add `webhook` service to docker-compose.yml: build `./services/webhook`, networks `[frontend-net]`, environment `WEBHOOK_SECRET=${WEBHOOK_SECRET}` and `DEPLOY_SCRIPT=/scripts/deploy.sh`, volume mount `./scripts:/scripts:ro` (read-only), `restart: unless-stopped`. No host ports.
4. Add Tailscale serve route: in the tailscale service startup, after `tailscale serve --bg --https=443 http://frontend:80`, also run `tailscale serve --bg --https=443 /webhook http://webhook:9000` to expose the webhook endpoint at `https://<hostname>.ts.net/webhook`.
5. Add WEBHOOK_SECRET to .env.example with a comment explaining it must match the GitHub webhook secret.
6. Add to DEPLOYMENT.md: GitHub Webhook Setup section — go to repo Settings → Webhooks → Add webhook, set Payload URL to `https://<hostname>.ts.net/webhook`, content type `application/json`, secret = WEBHOOK_SECRET value, trigger on push events only.

### Must-Haves
- HMAC validation uses crypto.timingSafeEqual (not string comparison)
- Invalid signatures return 401, not 200
- Deploy is async — webhook responds 200 before deploy completes
- Raw WEBHOOK_SECRET is never logged
- Webhook endpoint only fires deploy on push to refs/heads/main (not other branches or events)

## Inputs

- ``docker-compose.yml``
- ``.env.example``
- ``DEPLOYMENT.md``
- ``scripts/deploy.sh``

## Expected Output

- ``services/webhook/server.mjs``
- ``services/webhook/Dockerfile``
- ``docker-compose.yml``
- ``.env.example``
- ``DEPLOYMENT.md``

## Verification

test -f services/webhook/server.mjs && test -f services/webhook/Dockerfile && grep -q 'timingSafeEqual' services/webhook/server.mjs && grep -q 'webhook' docker-compose.yml
