import { PrismaClient, ScopeType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
  { name: 'Group Administrator', slug: 'group-administrator' },
  { name: 'Group CISO', slug: 'group-ciso' },
  { name: 'Group ISMS Manager', slug: 'group-isms-manager' },
  { name: 'Entity Security Officer', slug: 'entity-security-officer' },
  { name: 'Site Security Officer', slug: 'site-security-officer' },
  { name: 'Auditor', slug: 'auditor' },
  { name: 'Management', slug: 'management' },
  { name: 'Contributor', slug: 'contributor' },
  { name: 'Viewer', slug: 'viewer' },
];

const PERMISSIONS = [
  { name: 'Read Dashboard', slug: 'dashboard:read', module: 'dashboards' },
  { name: 'Read Entities', slug: 'entities:read', module: 'entities' },
  { name: 'Write Entities', slug: 'entities:write', module: 'entities' },
  { name: 'Read Users', slug: 'users:read', module: 'users' },
  { name: 'Read Documents', slug: 'documents:read', module: 'documents' },
  { name: 'Write Documents', slug: 'documents:write', module: 'documents' },
  { name: 'Read Audit Logs', slug: 'audit:read', module: 'audit-log' },
];

async function main() {
  console.log('🌱 Seeding OTTO demo data...');

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

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { slug: 'group-administrator' } });
  const perms = await prisma.permission.findMany();
  for (const perm of perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  const org = await prisma.organization.upsert({
    where: { code: 'ROSENBERGER' },
    update: {},
    create: { name: 'Rosenberger Group', code: 'ROSENBERGER', country: 'DE' },
  });

  const entitiesData = [
    { name: 'Rosenberger Germany', code: 'DE', country: 'Germany' },
    { name: 'Rosenberger Tunisia', code: 'TN', country: 'Tunisia' },
    { name: 'Rosenberger France', code: 'FR', country: 'France' },
    { name: 'Rosenberger USA', code: 'US', country: 'United States' },
  ];

  const entities = [];
  for (const e of entitiesData) {
    const entity = await prisma.entity.upsert({
      where: { organizationId_code: { organizationId: org.id, code: e.code } },
      update: {},
      create: { organizationId: org.id, ...e },
    });
    entities.push(entity);

    await prisma.site.upsert({
      where: { entityId_code: { entityId: entity.id, code: 'HQ' } },
      update: {},
      create: { entityId: entity.id, name: 'Headquarters', code: 'HQ', country: e.country },
    });
  }

  const passwordHash = await bcrypt.hash('OTTO2026!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rosenberger.com' },
    update: { passwordHash },
    create: {
      organizationId: org.id,
      email: 'admin@rosenberger.com',
      username: 'admin',
      fullName: 'OTTO Group Administrator',
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  await prisma.userEntityScope.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: admin.id,
      scopeType: ScopeType.GROUP,
    },
  });

  const entityOfficerRole = await prisma.role.findUniqueOrThrow({
    where: { slug: 'entity-security-officer' },
  });
  const tnEntity = entities.find((e) => e.code === 'TN')!;
  const tnOfficer = await prisma.user.upsert({
    where: { email: 'bilel.triaa@rosenberger.com' },
    update: { passwordHash },
    create: {
      organizationId: org.id,
      email: 'bilel.triaa@rosenberger.com',
      username: 'b.triaa',
      fullName: 'Bilel Triaa',
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: tnOfficer.id, roleId: entityOfficerRole.id } },
    update: {},
    create: { userId: tnOfficer.id, roleId: entityOfficerRole.id },
  });

  await prisma.userEntityScope.createMany({
    data: [{ userId: tnOfficer.id, scopeType: ScopeType.ENTITY, entityId: tnEntity.id }],
    skipDuplicates: true,
  });

  await prisma.document.createMany({
    data: [
      {
        title: 'Information Security Policy (DEMO)',
        description: 'Group-level ISMS policy — demo seed data',
        classification: 'CONFIDENTIAL',
        status: 'PUBLISHED',
        ownerId: admin.id,
      },
      {
        title: 'TISAX Assessment Report — Tunisia (DEMO)',
        description: 'Entity-level audit evidence — demo seed data',
        classification: 'INTERNAL',
        status: 'APPROVED',
        entityId: tnEntity.id,
        ownerId: tnOfficer.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ OTTO seed complete (DEMO data)');
  console.log('   admin@rosenberger.com / OTTO2026!');
  console.log('   bilel.triaa@rosenberger.com / OTTO2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
