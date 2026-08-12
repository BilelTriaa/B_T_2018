# OTTO System

**Inspired by unity. Driven by security.**

Enterprise cybersecurity governance platform — modular monolith architecture replacing Hannibal ISMS.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React · TypeScript · Vite · Tailwind CSS |
| Backend | NestJS · TypeScript · Prisma |
| Database | PostgreSQL |
| Storage | MinIO (S3-compatible) |
| Auth | JWT (dev) · Entra ID/OIDC (production-ready) |

## Quick Start

### 1. Copy environment

```bash
cp .env.example backend/.env
```

### 2. Start infrastructure

```bash
docker compose up postgres minio -d
```

### 3. Setup backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Open

- **Frontend:** http://localhost:5173
- **API:** http://localhost:4000
- **Swagger:** http://localhost:4000/api/docs

### Demo credentials (DEMO data)

| Email | Password | Role |
|-------|----------|------|
| admin@rosenberger.com | OTTO2026! | Group Administrator |
| bilel.triaa@rosenberger.com | OTTO2026! | Entity Security Officer (Tunisia) |

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).

## Phases

1. **MVP** (current) — Auth, RBAC, entities, audit log, documents
2. **One ISMS** — Risks, controls, SoA, audits (Hannibal migration)
3. **One Governance** — Policies, workflows, versioning
4. **One Path** — Maturity, frameworks, gap analysis
5. **Executive** — Group dashboards, analytics

## Migration from Hannibal ISMS

| Hannibal | OTTO |
|----------|------|
| Express + SQLite | NestJS + PostgreSQL |
| Session auth | JWT + SSO-ready |
| Simple roles | RBAC + entity scope |
| activity_log | Immutable audit_logs |

Phase 2 will migrate 93 ISO controls and 236 tasks from Hannibal ISMS.
