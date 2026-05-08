#!/usr/bin/env bash
set -euo pipefail

# Resolve the repo root (parent of the scripts/ directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

LOG_DIR="$HOME/deploy-logs"
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
