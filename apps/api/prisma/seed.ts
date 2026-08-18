import { PrismaClient, ScopeType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
  { name: 'Administrateur usine', slug: 'plant-administrator' },
  { name: 'Responsable production', slug: 'production-manager' },
  { name: 'Responsable qualité', slug: 'quality-manager' },
  { name: 'IT / Applications', slug: 'it-applications' },
  { name: 'Lecteur', slug: 'viewer' },
];

const PERMISSIONS = [
  { name: 'Lire le cockpit', slug: 'dashboard:read', module: 'dashboards' },
  { name: 'Lire les accès', slug: 'applications:read', module: 'applications' },
  { name: 'Lire la production', slug: 'production:read', module: 'production' },
  { name: 'Lire la qualité', slug: 'quality:read', module: 'quality' },
  { name: 'Lire les entités', slug: 'entities:read', module: 'entities' },
  { name: 'Écrire les entités', slug: 'entities:write', module: 'entities' },
  { name: 'Lire les utilisateurs', slug: 'users:read', module: 'users' },
  { name: 'Lire les documents', slug: 'documents:read', module: 'documents' },
  { name: 'Écrire les documents', slug: 'documents:write', module: 'documents' },
  { name: 'Lire les journaux', slug: 'audit:read', module: 'audit-log' },
];

async function main() {
  console.log('Seeding RTN AXIOME demo data...');

  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  for (const r of ROLES) {
    await prisma.role.upsert({
      where: { slug: r.slug },
      update: {},
      create: { ...r, isSystem: true },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { slug: 'plant-administrator' },
  });
  const perms = await prisma.permission.findMany();
  for (const perm of perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  const org = await prisma.organization.upsert({
    where: { code: 'RTN' },
    update: { name: 'Rosenberger Tunisia', country: 'TN' },
    create: { name: 'Rosenberger Tunisia', code: 'RTN', country: 'TN' },
  });

  const entity = await prisma.entity.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'RTN' } },
    update: { name: 'Rosenberger Tunisia', country: 'Tunisia' },
    create: {
      organizationId: org.id,
      name: 'Rosenberger Tunisia',
      code: 'RTN',
      country: 'Tunisia',
    },
  });

  const sites = [
    { name: 'Usine Enfidha — Production', code: 'ENF-PROD', country: 'Tunisia' },
    { name: 'Entrepôt import', code: 'ENF-WH-IN', country: 'Tunisia' },
    { name: 'Entrepôt export', code: 'ENF-WH-OUT', country: 'Tunisia' },
  ];
  for (const s of sites) {
    await prisma.site.upsert({
      where: { entityId_code: { entityId: entity.id, code: s.code } },
      update: { name: s.name },
      create: { entityId: entity.id, ...s },
    });
  }

  const departments = [
    { name: 'Production', code: 'PROD' },
    { name: 'Qualité', code: 'QA' },
    { name: 'Logistique', code: 'LOG' },
    { name: 'IT / Applications', code: 'IT' },
    { name: 'RH', code: 'HR' },
    { name: 'EHS', code: 'EHS' },
  ];
  for (const d of departments) {
    await prisma.department.upsert({
      where: { entityId_code: { entityId: entity.id, code: d.code } },
      update: { name: d.name },
      create: { entityId: entity.id, ...d },
    });
  }

  const passwordHash = await bcrypt.hash('AXIOME2026!', 10);

  const plantAdmin = await prisma.user.upsert({
    where: { email: 'bilel.triaa@rosenberger.com' },
    update: { passwordHash, fullName: 'Bilel Triaa', username: 'b.triaa' },
    create: {
      organizationId: org.id,
      email: 'bilel.triaa@rosenberger.com',
      username: 'b.triaa',
      fullName: 'Bilel Triaa',
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: plantAdmin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: plantAdmin.id, roleId: adminRole.id },
  });

  const existingScope = await prisma.userEntityScope.findFirst({
    where: { userId: plantAdmin.id, entityId: entity.id },
  });
  if (!existingScope) {
    await prisma.userEntityScope.create({
      data: {
        userId: plantAdmin.id,
        scopeType: ScopeType.ENTITY,
        entityId: entity.id,
      },
    });
  }

  const backupAdmin = await prisma.user.upsert({
    where: { email: 'admin@rtn.rosenberger.com' },
    update: { passwordHash, fullName: 'AXIOME Administrateur RTN' },
    create: {
      organizationId: org.id,
      email: 'admin@rtn.rosenberger.com',
      username: 'axiome.admin',
      fullName: 'AXIOME Administrateur RTN',
      passwordHash,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: backupAdmin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: backupAdmin.id, roleId: adminRole.id },
  });

  const apps = [
    {
      code: 'AXIOME',
      name: 'AXIOME',
      description: 'Portail d’accès unique de l’usine RTN Enfidha',
      category: 'Portail',
      route: '/',
      status: 'ONLINE' as const,
      owner: 'IT RTN',
      sortOrder: 1,
    },
    {
      code: 'MES',
      name: 'MES Production',
      description: 'Ordres de fabrication FAKRA, HSD et H-MTD',
      category: 'Production',
      route: '/production',
      status: 'ONLINE' as const,
      owner: 'Production',
      sortOrder: 2,
    },
    {
      code: 'QMS',
      name: 'Qualité / NCR',
      description: 'Non-conformités, audits et preuves TISAX',
      category: 'Qualité',
      route: '/qualite',
      status: 'ONLINE' as const,
      owner: 'Qualité',
      sortOrder: 3,
    },
    {
      code: 'GED',
      name: 'GED Usine',
      description: 'Politiques, modes opératoires et documents RH',
      category: 'Documents',
      route: '/documents',
      status: 'ONLINE' as const,
      owner: 'Qualité',
      sortOrder: 4,
    },
    {
      code: 'SAP',
      name: 'SAP ERP',
      description: 'Achats, stocks et finance groupe',
      category: 'ERP',
      url: null,
      status: 'ONLINE' as const,
      owner: 'IT Groupe',
      sortOrder: 5,
    },
    {
      code: 'INTERVALID',
      name: 'Intervalid',
      description: 'ISMS local du site (ne remplace pas OTTO Groupe)',
      category: 'ISMS',
      status: 'ONLINE' as const,
      owner: 'EHS / ISMS',
      sortOrder: 6,
    },
    {
      code: 'OTTO',
      name: 'OTTO ISMS Groupe',
      description: 'Vue consolidée Rosenberger Group',
      category: 'ISMS',
      status: 'MAINTENANCE' as const,
      owner: 'Group CISO',
      sortOrder: 7,
    },
    {
      code: 'BADGE',
      name: 'Contrôle d’accès / badges',
      description: 'Accès ateliers, entrepôts et bureaux Enfidha',
      category: 'Accès',
      status: 'ONLINE' as const,
      owner: 'EHS',
      sortOrder: 8,
    },
  ];

  for (const app of apps) {
    await prisma.application.upsert({
      where: { code: app.code },
      update: app,
      create: app,
    });
  }

  const workOrders = [
    {
      number: 'OF-2608-0142',
      line: 'FAKRA',
      product: 'FAKRA cable assembly — customer A',
      quantity: 12000,
      completed: 8640,
      status: 'IN_PROGRESS' as const,
      shift: 'Équipe A',
      dueDate: new Date('2026-08-20'),
    },
    {
      number: 'OF-2608-0148',
      line: 'HSD',
      product: 'RosenbergerHSD® harness',
      quantity: 4500,
      completed: 2100,
      status: 'IN_PROGRESS' as const,
      shift: 'Équipe B',
      dueDate: new Date('2026-08-21'),
    },
    {
      number: 'OF-2608-0151',
      line: 'H-MTD',
      product: 'H-MTD® high-speed data link',
      quantity: 2800,
      completed: 2800,
      status: 'QC_HOLD' as const,
      shift: 'Équipe A',
      dueDate: new Date('2026-08-18'),
    },
    {
      number: 'OF-2608-0155',
      line: 'FAKRA',
      product: 'FAKRA cable assembly — customer B',
      quantity: 8000,
      completed: 0,
      status: 'PLANNED' as const,
      shift: 'Équipe C',
      dueDate: new Date('2026-08-22'),
    },
  ];
  for (const wo of workOrders) {
    await prisma.workOrder.upsert({
      where: { number: wo.number },
      update: wo,
      create: wo,
    });
  }

  const ncrs = [
    {
      number: 'NCR-2608-017',
      title: 'Côté sertissage hors tolérance — lot HSD 148',
      line: 'HSD',
      severity: 'MAJOR' as const,
      status: 'OPEN' as const,
    },
    {
      number: 'NCR-2608-019',
      title: 'Marquage étiquette illisible — FAKRA',
      line: 'FAKRA',
      severity: 'MINOR' as const,
      status: 'IN_PROGRESS' as const,
    },
    {
      number: 'NCR-2608-012',
      title: 'Écart de longueur H-MTD — échantillon QC',
      line: 'H-MTD',
      severity: 'CRITICAL' as const,
      status: 'CLOSED' as const,
    },
  ];
  for (const ncr of ncrs) {
    await prisma.qualityRecord.upsert({
      where: { number: ncr.number },
      update: ncr,
      create: ncr,
    });
  }

  const docs = [
    {
      title: 'Règlement intérieur RTN Enfidha',
      description: 'Accès usine, badges et consignes EHS',
      classification: 'INTERNAL' as const,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Mode opératoire FAKRA — assemblage câbles',
      description: 'WI production ligne FAKRA',
      classification: 'CONFIDENTIAL' as const,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Rapport TISAX — Rosenberger Tunisia (démo)',
      description: 'Preuve d’audit entité RTN',
      classification: 'RESTRICTED' as const,
      status: 'APPROVED' as const,
    },
  ];
  for (const doc of docs) {
    const existing = await prisma.document.findFirst({ where: { title: doc.title } });
    if (!existing) {
      await prisma.document.create({
        data: { ...doc, entityId: entity.id, ownerId: plantAdmin.id },
      });
    }
  }

  console.log('RTN AXIOME seed complete (DEMO)');
  console.log('   bilel.triaa@rosenberger.com / AXIOME2026!');
  console.log('   admin@rtn.rosenberger.com / AXIOME2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
