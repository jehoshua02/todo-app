---
estimated_steps: 10
estimated_files: 2
skills_used: []
---

# T03: Add deploy script, NSSM WSL autostart, and deployment docs

Create a `scripts/deploy.sh` that pulls latest and runs `docker compose up -d --build` in the prod clone. Document how to set up the prod clone, configure NSSM to start WSL at Windows boot, and perform the first deploy.

### Steps
1. Create `scripts/deploy.sh`: resolves the directory of the script, cds to project root, runs `git pull --ff-only && docker compose up -d --build 2>&1 | tee -a ~/deploy-logs/$(date +%Y%m%d-%H%M%S).log`. Create deploy-logs dir if missing. Exit non-zero on git pull failure.
2. Make scripts/deploy.sh executable (`chmod +x`).
3. Create `DEPLOYMENT.md` at repo root with sections: Prerequisites (Tailscale, Docker, Node, NSSM), First Deploy (clone repo, create .env, run scripts/deploy.sh), Keeping Prod Up (NSSM service setup steps — create service pointing at `wsl.exe -d Ubuntu` or the user's distro, set startup type automatic, test with sc start), Manual Deploy (cd prod clone, ./scripts/deploy.sh), Troubleshooting (check docker compose logs, check tailscale status).
4. The NSSM setup instructions should include: download NSSM, `nssm install wsl-autostart wsl.exe`, set arguments to `-d Ubuntu` (note: user's distro name may differ — document how to check with `wsl -l -v`), set startup type to Automatic, and note that Docker and Tailscale start via systemd once WSL is running.

### Must-Haves
- scripts/deploy.sh is idempotent — running it twice is safe
- DEPLOYMENT.md covers the complete first-deploy flow end to end
- Log output is dated and persisted to ~/deploy-logs/ for debugging

## Inputs

- ``docker-compose.yml``
- ``.env.example``

## Expected Output

- ``scripts/deploy.sh``
- ``DEPLOYMENT.md``

## Verification

test -f scripts/deploy.sh && test -x scripts/deploy.sh && test -f DEPLOYMENT.md && grep -c '^## ' DEPLOYMENT.md | grep -qE '[3-9]|[0-9]{2}'
