# OTTO System — Database Design (Phase 1 MVP)

## ERD Overview

```text
Organization (Group)
  └── Entity (1:N)
        ├── Site (1:N)
        ├── Department (1:N)
        └── Document (1:N)

User (N:M) Role via UserRole
Role (N:M) Permission via RolePermission
User (N:M) Entity/Site scope via UserEntityScope

AuditLog — append-only, references User, Entity, Site
Document — owned by User, scoped to Entity
DocumentVersion — version history per Document
```

## Core Tables (MVP)

| Table | Purpose |
|-------|---------|
| organizations | Rosenberger Group |
| entities | DE, TN, FR, US subsidiaries |
| sites | HQ, industrial sites per entity |
| users | Platform users |
| roles | 9 RBAC roles |
| permissions | Granular API permissions |
| user_roles | User ↔ Role mapping |
| role_permissions | Role ↔ Permission mapping |
| user_entity_scopes | Entity-level authorization |
| audit_logs | Immutable security audit trail |
| documents | ISMS documents (basic MVP) |
| document_versions | Version history |

## Authorization Model

```text
User → UserRole → Role → RolePermission → Permission
User → UserEntityScope → Entity | Site | GROUP
```

API checks both permission slug AND entity scope before returning data.

## Phase 2 Additions (planned)

- frameworks, controls, control_framework_mappings
- risks, risk_treatments
- audits, audit_findings, corrective_actions
- evidence, maturity_assessments, roadmaps

Hannibal ISMS migration will populate controls (93) and tasks (236) in Phase 2.
