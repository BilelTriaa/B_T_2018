import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/production')
export class ProductionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('work-orders')
  @RequirePermissions('production:read')
  list() {
    return this.prisma.workOrder.findMany({
      orderBy: { dueDate: 'asc' },
    });
  }
}
