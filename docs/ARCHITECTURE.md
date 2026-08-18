# OTTO System — Architecture

**Inspired by unity. Driven by security.**

## Vision

OTTO transforms fragmented local security management into a unified, measurable and auditable cybersecurity governance platform.

**One Group → One Governance → One ISMS → One Path → Multiple Entities**

## Architecture Pattern

**Secure Modular Monolith** (NestJS) — not microservices for MVP.

Modules are bounded and can be extracted later if scale requires it.

```
┌─────────────────────────────────────────────────────────┐
│                    OTTO PORTAL (React)                   │
│         Tailwind · shadcn/ui · TanStack Query            │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / REST /api/v1
┌──────────────────────────▼──────────────────────────────┐
│                   NestJS API (Modular Monolith)          │
│  auth · users · organizations · entities · roles         │
│  permissions · documents · audit-log · dashboards        │
└──────────────┬─────────────────────────┬────────────────┘
               │                         │
    ┌──────────▼──────────┐   ┌─────────▼─────────┐
    │     PostgreSQL      │   │  S3 (MinIO dev)   │
    │  Prisma ORM         │   │  Documents/Evidence│
    └─────────────────────┘   └───────────────────┘
               │
    ┌──────────▼──────────┐
    │  Microsoft Entra ID │
    │  OAuth2 / OIDC      │
    └─────────────────────┘
```

## Backend Module Map

| Module | Identifier | Phase |
|--------|------------|-------|
| Authentication | `auth` | MVP |
| Users | `users` | MVP |
| Organizations | `organizations` | MVP |
| Entities | `entities` | MVP |
| Sites | `sites` | MVP |
| Roles & Permissions | `roles` | MVP |
| Audit Log | `audit-log` | MVP |
| Documents | `documents` | MVP |
| ISMS | `isms` | Phase 2 |
| Governance | `governance` | Phase 3 |
| One Path | `path` | Phase 4 |
| Executive | `dashboards` | Phase 5 |

## RBAC Model

| Role | Scope | Key permissions |
|------|-------|-----------------|
| Group Administrator | GROUP | Full platform admin |
| Group CISO | GROUP | Global security visibility |
| Group ISMS Manager | GROUP | Frameworks, risks, audits |
| Entity Security Officer | ENTITY | Assigned entity only |
| Site Security Officer | SITE | Assigned site only |
| Auditor | Assigned scope | Read-only audit data |
| Management | GROUP | Executive dashboards |
| Contributor | Scoped | Create/update assigned records |
| Viewer | Scoped | Read-only |

## Entity Authorization

Authorization = **Role permissions** AND **Entity scope**.

- API guards enforce scope on every sensitive endpoint.
- Entity Security Officer cannot access another entity's data.
- Audit logs record all denied access attempts.

## Security Architecture

- JWT auth (dev) + Entra ID OIDC (production-ready hooks)
- RBAC + entity scope guards on all API routes
- Append-only audit log (no update/delete for normal users)
- Input validation (class-validator + Zod frontend)
- Helmet, rate limiting, CORS
- Secrets via environment variables only

## Migration from Hannibal ISMS

| Hannibal ISMS | OTTO System |
|---------------|-------------|
| Express monolith | NestJS modular monolith |
| SQLite | PostgreSQL |
| Session auth | JWT + SSO-ready |
| Simple roles | RBAC + entity scope |
| activity_log | Immutable audit_logs |
| controls/tasks | Phase 2 (isms module) |
| Static SPA | React + TypeScript |

Seed data from Hannibal (93 controls, 236 tasks) will be migrated in Phase 2.
