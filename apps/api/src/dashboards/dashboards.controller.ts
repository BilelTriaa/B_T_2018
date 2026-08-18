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
    const [sites, users, documents, applications, workOrders, openNcrs, inProgress] =
      await Promise.all([
        this.prisma.site.count({
          where: user.scopeType === 'GROUP' ? {} : { entityId: { in: user.entityIds } },
        }),
        this.prisma.user.count({ where: { status: 'ACTIVE' } }),
        this.prisma.document.count({
          where: user.scopeType === 'GROUP' ? {} : { entityId: { in: user.entityIds } },
        }),
        this.prisma.application.count({ where: { status: 'ONLINE' } }),
        this.prisma.workOrder.count(),
        this.prisma.qualityRecord.count({ where: { status: { not: 'CLOSED' } } }),
        this.prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
      ]);

    return {
      plant: 'Rosenberger Tunisia (RTN)',
      site: 'Novation Industrial City, Enfidha',
      tagline: 'Un accès. Toute l’usine.',
      headcount: 500,
      oee: 91,
      onTimeDelivery: 96,
      qualityYield: 98.4,
      kpis: {
        sites,
        activeUsers: users,
        documents,
        applicationsOnline: applications,
        workOrders,
        openNcrs,
        workOrdersInProgress: inProgress,
      },
      demo: true,
    };
  }
}
