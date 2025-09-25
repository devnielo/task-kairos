#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
SAMPLE_SCRIPT="${ROOT_DIR}/scripts/mongo-init/sample-data.js"

log() {
  printf '%s\n' "$1"
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    log "Docker is not installed or not on PATH. Install Docker Desktop or Docker Engine and retry."
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    log "Docker daemon is not running. Start Docker and rerun this script."
    exit 1
  fi
}

main() {
  require_docker

  if [[ ! -f "$SAMPLE_SCRIPT" ]]; then
    log "Sample data script not found at $SAMPLE_SCRIPT"
    exit 1
  fi

  log "Seeding MongoDB using $SAMPLE_SCRIPT"
  docker compose exec mongo mongosh --quiet /docker-entrypoint-initdb.d/sample-data.js
  log "Seed completed successfully."
}

main "$@"
