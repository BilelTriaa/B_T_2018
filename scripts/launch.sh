#!/usr/bin/env bash
# Launch OTTO locally: Postgres + migrate/seed + API + web.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.nvm/versions/node/current/bin:${HOME}/.nvm/versions/node/v22.22.2/bin:${HOME}/.local/share/pnpm:${PATH}"

log() { printf '🛡️  %s\n' "$*"; }

has_docker() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

wait_for_postgres() {
  local host="${1:-127.0.0.1}"
  local port="${2:-5432}"
  local i
  for i in $(seq 1 40); do
    if command -v pg_isready >/dev/null 2>&1; then
      pg_isready -h "$host" -p "$port" -q && return 0
    elif PGPASSWORD="${PGPASSWORD:-otto_dev_password}" psql -h "$host" -p "$port" -U otto -d otto -c 'SELECT 1' >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

ensure_native_postgres() {
  if ! command -v pg_isready >/dev/null 2>&1 && ! command -v psql >/dev/null 2>&1; then
    log "Installing PostgreSQL (no Docker available)…"
    sudo apt-get update -qq
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
  fi

  if command -v pg_ctlcluster >/dev/null 2>&1; then
    sudo pg_ctlcluster 16 main start 2>/dev/null || true
  fi
  if command -v service >/dev/null 2>&1; then
    sudo service postgresql start 2>/dev/null || true
  fi

  wait_for_postgres 127.0.0.1 5432 || {
    echo "PostgreSQL did not become ready on 127.0.0.1:5432" >&2
    exit 1
  }

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='otto'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER otto WITH PASSWORD 'otto_dev_password' SUPERUSER;"
  fi
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='otto'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE DATABASE otto OWNER otto;"
  fi
}

ensure_env() {
  if [[ ! -f .env ]]; then
    cp .env.example .env
    if ! has_docker; then
      sed -i 's@:5433/@:5432/@' .env
    fi
  fi
  # Same-origin Vite proxy is more reliable behind port forwarding.
  if grep -q '^VITE_API_BASE_URL=' .env; then
    sed -i 's@^VITE_API_BASE_URL=.*@VITE_API_BASE_URL=@' .env
  else
    printf '\nVITE_API_BASE_URL=\n' >> .env
  fi
  mkdir -p apps/api apps/web
  cp .env apps/api/.env
  cp .env apps/web/.env
}

ensure_postgres() {
  if has_docker; then
    log "Starting Postgres via Docker Compose…"
    docker compose up postgres -d
    wait_for_postgres 127.0.0.1 5433 || wait_for_postgres 127.0.0.1 5432
    return
  fi
  log "Starting native PostgreSQL…"
  ensure_native_postgres
}

log "Launching OTTO System"
ensure_env
ensure_postgres

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi

if [[ ! -d node_modules ]]; then
  log "Installing workspace dependencies…"
  pnpm install
fi

log "Applying database schema and demo seed…"
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed

log "Building shared package…"
pnpm --filter @otto/shared build

log "API → http://localhost:4000   Web → http://localhost:5173"
log "Demo login: admin@rosenberger.com / OTTO2026!"
exec pnpm dev
