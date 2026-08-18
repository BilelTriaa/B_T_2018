# RTN AXIOME

Portail d’accès unique de **Rosenberger Tunisia (RTN)**, usine Enfidha (Novation Industrial City).

AXIOME ouvre les applications de l’usine — production FAKRA / HSD / H-MTD, qualité, GED, équipe — sans remplacer l’ERP groupe (SAP), l’ISMS local (Intervalid) ni OTTO (ISMS Groupe).

## Lancer

```bash
pnpm launch
```

- Web: http://localhost:5173
- API: http://localhost:4000
- Santé: http://localhost:4000/health
- Swagger: http://localhost:4000/api/docs

**Connexion démo**

- `bilel.triaa@rosenberger.com` / `AXIOME2026!`
- `admin@rtn.rosenberger.com` / `AXIOME2026!`

## Modules

| Route | Rôle |
| --- | --- |
| Cockpit | KPIs usine (OEE, OTD, NCR, OF) |
| Accès applications | Catalogue RTN — bouton **Ouvrir** |
| Production | Ordres de fabrication par ligne |
| Qualité | NCR ouvertes / clôturées |
| Documents | GED usine |
| Équipe / sites | Production, entrepôts import/export |

## Stack

```
apps/web     React + Vite + Tailwind
apps/api     NestJS + Prisma + PostgreSQL
packages/shared
```
