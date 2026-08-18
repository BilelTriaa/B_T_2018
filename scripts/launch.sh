#!/usr/bin/env bash
# Launch RTN AXIOME locally: Postgres + migrate/seed + API + web.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.nvm/versions/node/current/bin:${HOME}/.nvm/versions/node/v22.22.2/bin:${HOME}/.local/share/pnpm:${PATH}"

log() { printf '◆  %s\n' "$*"; }

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
    elif PGPASSWORD="${PGPASSWORD:-axiome_dev_password}" psql -h "$host" -p "$port" -U axiome -d axiome -c 'SELECT 1' >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

ensure_native_postgres() {
  if ! command -v pg_isready >/dev/null 2>&1 && ! command -v psql >/dev/null 2>&1; then
    log "Installation de PostgreSQL…"
    sudo apt-get update -qq
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
  fi

  if command -v pg_ctlcluster >/dev/null 2>&1; then
    sudo pg_ctlcluster 16 main start 2>/dev/null || true
    sudo pg_ctlcluster 14 main start 2>/dev/null || true
  fi
  if command -v service >/dev/null 2>&1; then
    sudo service postgresql start 2>/dev/null || true
  fi

  wait_for_postgres 127.0.0.1 5432 || {
    echo "PostgreSQL did not become ready on 127.0.0.1:5432" >&2
    exit 1
  }

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='axiome'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER axiome WITH PASSWORD 'axiome_dev_password' SUPERUSER;"
  fi
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='axiome'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE DATABASE axiome OWNER axiome;"
  fi
}

ensure_env() {
  if [[ ! -f .env ]]; then
    cp .env.example .env
    if ! has_docker; then
      sed -i 's@:5433/@:5432/@' .env
    fi
  fi
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
    log "Démarrage de Postgres via Docker Compose…"
    docker compose up postgres -d
    wait_for_postgres 127.0.0.1 5433 || wait_for_postgres 127.0.0.1 5432
    return
  fi
  log "Démarrage de PostgreSQL natif…"
  ensure_native_postgres
}

log "Ouverture de RTN AXIOME"
ensure_env
ensure_postgres

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi

if [[ ! -d node_modules ]]; then
  log "Installation des dépendances…"
  pnpm install
fi

log "Schéma base et données démo…"
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed

log "Build du package partagé…"
pnpm --filter @otto/shared build

log "API → http://localhost:4000   Web → http://localhost:5173"
log "Connexion démo: bilel.triaa@rosenberger.com / AXIOME2026!"
exec pnpm dev
