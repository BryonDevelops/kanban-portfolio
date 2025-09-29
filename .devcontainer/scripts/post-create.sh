#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="/workspaces/kanban-portfolio"
cd "$WORKSPACE"

log() {
  printf "[devcontainer] %s\n" "$1"
}

load_devcontainer_env() {
  local env_file=".devcontainer/devcontainer.env"

  if [ ! -f "$env_file" ]; then
    log "No .devcontainer/devcontainer.env file found. Skipping secret bootstrap."
    return
  fi

  log "Loading environment overrides from $env_file"
  while IFS='=' read -r key raw_value; do
    if [[ -z "$key" || "$key" =~ ^# ]]; then
      continue
    fi
    # Trim trailing carriage returns (Windows)
    local value
    value="${raw_value%%$'\r'}"
    export "$key"="$value"
  done < "$env_file"
}

log "Bootstrapping Kanban Portfolio workspace"
load_devcontainer_env

if [ ! -f .env.local ]; then
  log "Creating .env.local from template"
  cp .env.local.example .env.local
fi

if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
fi

log "Installing npm dependencies"
npm install

log "Configuring git hooks"
npm run prepare || true

if [ -f package.json ] && npx --yes playwright --version >/dev/null 2>&1; then
  log "Ensuring Playwright browsers are available"
  npx --yes playwright install >/dev/null 2>&1 || true
fi

log "Dev container setup complete"
