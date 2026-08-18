# OTTO Platform Specification

Authoritative product and engineering rules for the Rosenberger Group ISMS platform.

## Vision

OTTO is a **Group-wide consolidation layer** on top of each site's existing ISMS tool (**Intervalid**). It synchronizes site data into a unified Group model and exposes executive, governance, and maturity views across all sites.

```
Site ISMS (Intervalid)  →  OTTO Sync  →  Group model  →  Global dashboards
```

## Domain model

| Entity | Role |
|--------|------|
| Site | Rosenberger entity/site |
| Document | Policies, evidence, attachments |
| Control | Framework controls |
| SoAEntry | Statement of Applicability |
| Risk / Treatment | Site-level risk management |
| GroupRisk | Aggregated Group risk view |
| RoadmapItem | One Path maturity roadmap |
| MaturityScore | ISO / TISAX / NIS2 scores |
| SyncRecord | Provenance & sync audit trail |

## RBAC

| Role | Access |
|------|--------|
| GROUP_ADMIN | All sites, all modules |
| SITE_OFFICER | Own site + Group read views |
| CONTRIBUTOR | Assigned records within scope |
| AUDITOR | Read-only audit scope |

## Target monorepo layout

```
otto-system/
├── apps/
│   ├── web/          # React front-end
│   └── api/          # NestJS back-end
├── packages/
│   └── shared/       # Shared TypeScript types
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## API modules

`isms` · `governance` · `path` · `entities` · `executive` · `sync` · `analytics` · `auth`

## Design identity

- **Tagline:** Inspired by unity. Driven by security.
- **Motif:** Crown
- **Theme:** Dark executive (midnight + gold accents)
- **UX rule:** Always show whether the user is in **Site** or **Group** context

See `.cursor/rules/otto-platform.mdc` for agent-enforced standards.
