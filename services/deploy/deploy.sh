#!/usr/bin/env bash
set -euo pipefail

# When invoked from the deploy container, /repo is the mounted repo root.
# When invoked directly on the host, resolve relative to this script.
if [ -d "/repo/.git" ]; then
  REPO_ROOT="/repo"
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

LOG_DIR="${DEPLOY_LOG_DIR:-$HOME/deploy-logs}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date +%Y%m%d-%H%M%S).log"

log() {
  echo "[$(date '+%Y-%m-%dT%H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "Starting deploy from $REPO_ROOT"

cd "$REPO_ROOT"

log "Pulling latest from origin..."
git pull --ff-only 2>&1 | tee -a "$LOG_FILE"

log "Building and starting services..."
docker compose up -d --build 2>&1 | tee -a "$LOG_FILE"

log "Deploy complete. Log saved to $LOG_FILE"
