# OTTO System

**Inspired by unity. Driven by security.**

OTTO is the Rosenberger Group’s consolidated ISMS platform: it sits on top of each site’s existing ISMS tool (Intervalid), synchronises site data into one Group model, and provides a unified global view across all entities — without replacing local site tooling.

## Monorepo structure

```text
otto-system/
├── apps/
│   ├── web/              # React + Vite front-end
│   └── api/              # NestJS REST API
├── packages/
│   └── shared/           # Shared TypeScript types & constants
├── docs/                 # Architecture & product specs
├── docker-compose.yml    # Postgres, MinIO, services (legacy + future)
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json          # Root scripts & shared dev tooling
```

> **Note:** The legacy `frontend/` and `backend/` folders remain as reference during verification. **New development uses `apps/*` and `packages/*`.**

## Prerequisites

- **Node.js** ≥ 22
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Docker Desktop** (for PostgreSQL and MinIO)

## Install

From the repository root:

```bash
pnpm install
```

## Verify workspace setup

```bash
# List all workspace packages
pnpm list -r --depth 0

# Type-check every workspace
pnpm typecheck

# Build every workspace (shared → api → web)
pnpm build

# Lint every workspace
pnpm lint
```

## Environment

```bash
cp .env.example .env
```

Edit `.env` with your local values before running services.

## Run

Infrastructure:

```bash
docker compose up postgres minio -d
```

Database (first time or after schema changes):

```bash
cp .env.example .env   # if not done yet
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Development — run in two terminals:

```bash
pnpm dev:api    # NestJS API → http://localhost:4000
pnpm dev:web    # React app  → http://localhost:5173
```

Demo login: `admin@rosenberger.com` / `OTTO2026!`

Legacy MVP (still available during migration):

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Documentation

- [OTTO product spec](docs/OTTO-SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## RBAC roles

| Role | Scope |
|------|-------|
| `GROUP_ADMIN` | All sites |
| `SITE_OFFICER` | Own site + Group read views |
| `CONTRIBUTOR` | Assigned records |
| `AUDITOR` | Read-only audit scope |
