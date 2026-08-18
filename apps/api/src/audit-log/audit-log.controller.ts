import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../common/types/auth.types';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/audit-logs')
export class AuditLogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('audit:read')
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit = '50',
    @Query('entityId') entityId?: string,
  ) {
    const take = Math.min(parseInt(limit, 10) || 50, 200);
    const where =
      user.scopeType === 'GROUP'
        ? { ...(entityId ? { entityId } : {}) }
        : { entityId: { in: user.entityIds } };

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take,
    });
  }
}
