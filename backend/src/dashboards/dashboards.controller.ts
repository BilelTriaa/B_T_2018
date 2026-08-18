import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import type { AuthenticatedUser } from '../common/types/auth.types';

@ApiTags('dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/dashboards')
export class DashboardsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('overview')
  @RequirePermissions('dashboard:read')
  async overview(@CurrentUser() user: AuthenticatedUser) {
    const entityFilter =
      user.scopeType === 'GROUP' ? {} : { id: { in: user.entityIds } };

    const [entities, users, documents, auditEvents, openDocuments] = await Promise.all([
      this.prisma.entity.count({ where: entityFilter }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.document.count({
        where: user.scopeType === 'GROUP' ? {} : { entityId: { in: user.entityIds } },
      }),
      this.prisma.auditLog.count({
        where: { timestamp: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
      }),
      this.prisma.document.count({ where: { status: 'DRAFT' } }),
    ]);

    return {
      tagline: 'Inspired by unity. Driven by security.',
      securityScore: 86,
      compliance: 91,
      openRisks: 24,
      maturity: 82,
      kpis: {
        entities,
        activeUsers: users,
        documents,
        auditEventsLast7Days: auditEvents,
        draftDocuments: openDocuments,
      },
      demo: true,
    };
  }
}
