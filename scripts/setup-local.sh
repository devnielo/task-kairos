#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
SHOULD_RUN_NPM_INSTALL=1

log_step() {
  printf '\n=== %s ===\n' "$1"
}

run_cmd() {
  local cmd="$1"
  log_step "Running: ${cmd}"
  (cd "$ROOT_DIR" && eval "$cmd")
}

ensure_dir() {
  local dir_path="$ROOT_DIR/$1"
  if [[ ! -d "$dir_path" ]]; then
    mkdir -p "$dir_path"
    echo "Created directory: $1"
  fi
}

copy_env_if_missing() {
  if [[ ! -f "$ROOT_DIR/.env" && -f "$ROOT_DIR/.env.example" ]]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    echo "Copied .env.example to .env"
    echo "Please review and update .env with your desired configuration."
  fi
}

check_node_environment() {
  if command -v npm >/dev/null 2>&1; then
    local npm_version
    npm_version=$(npm --version 2>/dev/null || true)
    echo "Detected npm (${npm_version:-unknown version})."
    SHOULD_RUN_NPM_INSTALL=1
    return
  fi

  if command -v nvm >/dev/null 2>&1; then
    echo "Detected nvm but npm is not currently available. Run 'nvm use <version>' and rerun this script if you want local npm dependencies."
    echo "Continuing without 'npm install'; Docker containers will manage runtime dependencies."
    SHOULD_RUN_NPM_INSTALL=0
    return
  fi

  echo "Node.js/npm were not detected on this machine."
  echo "Docker Compose will still start the API, worker, MongoDB, and Redis, but local npm commands will be unavailable until you install Node.js or nvm."
  SHOULD_RUN_NPM_INSTALL=0
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed or not on PATH. Install Docker Desktop or Docker Engine and retry."
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running. Start Docker and rerun this script."
    exit 1
  fi
}

main() {
  echo "Initializing local environment for Image Processing API..."

  copy_env_if_missing

  ensure_dir "storage/input"
  ensure_dir "storage/output"

  check_node_environment
  require_docker

  if [[ "$SHOULD_RUN_NPM_INSTALL" -eq 1 ]]; then
    run_cmd "npm install"
  else
    echo "Skipping local 'npm install'."
  fi
  run_cmd "docker compose up -d"

  cat <<'EOF'

Environment ready!

Next steps:
  1. Services (API, worker, MongoDB, Redis) are running via Docker. Check with: docker compose ps
  2. Visit http://localhost:3000/docs to interact with the API
  3. Optionally run `node scripts/run-sample-task.mjs` to trigger a sample task
  4. For local development outside Docker, stop the containers and follow the manual setup section in README.md
EOF
}

main "$@"
