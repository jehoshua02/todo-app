# Deployment Guide

This app runs on Docker Compose behind Tailscale Funnel, giving you HTTPS on a public `.ts.net` domain with zero port conflicts between dev and prod on the same machine.

## Prerequisites

- **Docker** installed and running (verified: `docker compose version`)
- **Tailscale** installed and authenticated on the host machine (`tailscale status`)
- **HTTPS certificates** enabled in Tailscale admin console: [Admin → DNS → Enable HTTPS](https://login.tailscale.com/admin/dns)
- **Funnel** enabled in your tailnet ACL policy (Admin → Access Controls, add `"funnel": [...]` grant or toggle per-machine)
- **NSSM** installed on Windows for WSL autostart (see [Keeping Prod Up](#keeping-prod-up))

## First Deploy

### 1. Clone the repo

```bash
git clone https://github.com/<your-org>/todo-app.git ~/todo-app-prod
cd ~/todo-app-prod
```

### 2. Create `.env`

Copy the example and fill in production values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Generate with: openssl rand -hex 32
JWT_SECRET=<long-random-string>
WEBHOOK_SECRET=<long-random-string>

# Your Tailscale machine hostname and domain
# Run `tailscale status` to find your machine name and tailnet
TS_HOSTNAME=todo-app-prod
TS_AUTHKEY=tskey-auth-xxxx-xxxxxxxxxxxx

# WebAuthn must match the domain users hit in the browser
# After Funnel is up, this will be your .ts.net domain
RP_ID=todo-app-prod.tail1234.ts.net
RP_ORIGIN=https://todo-app-prod.tail1234.ts.net

# DB credentials (change from defaults)
AUTH_DB_PASSWORD=<strong-password>
TASKS_DB_PASSWORD=<strong-password>
```

### 3. Run the deploy script

```bash
./scripts/deploy.sh
```

This pulls latest, builds images, and starts all services. Logs are saved to `~/deploy-logs/`.

### 4. Verify

- Check services: `docker compose ps`
- Check Tailscale: `docker compose logs tailscale` — look for `serving` and Funnel active
- Open `https://<your-hostname>.tail<net>.ts.net` in a browser

## Manual Deploy

After the initial setup, deploying a new version is:

```bash
cd ~/todo-app-prod
./scripts/deploy.sh
```

## Auto-Deploy via GitHub Webhook

Once the webhook server is running (included in the compose stack), GitHub can trigger deploys automatically on push to `main`.

See [GitHub Webhook Setup](#github-webhook-setup) below.

## Keeping Prod Up

WSL doesn't auto-start on Windows reboot. Use NSSM to run WSL as a Windows service.

### Check your WSL distro name

Open PowerShell:

```powershell
wsl -l -v
```

Note the `NAME` column (e.g. `Ubuntu`, `Ubuntu-22.04`).

### Install NSSM

Download from [nssm.cc](https://nssm.cc/download) or via Scoop:

```powershell
scoop install nssm
```

### Create the WSL service

Open **PowerShell as Administrator**:

```powershell
nssm install wsl-autostart wsl.exe
nssm set wsl-autostart AppParameters "-d Ubuntu"   # replace Ubuntu with your distro name
nssm set wsl-autostart Start SERVICE_AUTO_START
nssm set wsl-autostart AppStdout C:\wsl-autostart.log
nssm set wsl-autostart AppStderr C:\wsl-autostart.log
```

Start it now to verify:

```powershell
nssm start wsl-autostart
```

Once WSL starts, systemd brings up Docker and Tailscale automatically (both are enabled via systemd). Your compose stack restarts because all services have `restart: unless-stopped`.

### Test after reboot

Reboot Windows, wait ~30 seconds, then open `https://<your-hostname>.ts.net` — it should be live.

## GitHub Webhook Setup

1. In your GitHub repo: **Settings → Webhooks → Add webhook**
2. Set:
   - **Payload URL**: `https://<your-hostname>.tail<net>.ts.net/webhook`
   - **Content type**: `application/json`
   - **Secret**: the value of `WEBHOOK_SECRET` from your `.env`
   - **Events**: choose "Just the push event"
3. Click **Add webhook**

On every merge to `main`, GitHub sends a signed payload to `/webhook`. The server validates the HMAC-SHA256 signature and runs `scripts/deploy.sh` if the push is to `refs/heads/main`.

Deploy logs are appended to `~/deploy-logs/` on the prod host.

## Troubleshooting

**Services not starting:**
```bash
docker compose ps
docker compose logs <service-name>
```

**Tailscale not connecting:**
```bash
docker compose logs tailscale
```
Check that `TS_AUTHKEY` is valid and HTTPS/Funnel are enabled in your tailnet admin.

**WebAuthn failing on mobile:**
- Confirm `RP_ID` and `RP_ORIGIN` in `.env` exactly match the domain in the browser URL bar
- Must be HTTPS — plain HTTP won't work for WebAuthn on non-localhost origins

**WSL not starting after reboot:**
```powershell
sc query wsl-autostart    # check service state
sc start wsl-autostart    # start manually
```
Then check `C:\wsl-autostart.log` for errors.
