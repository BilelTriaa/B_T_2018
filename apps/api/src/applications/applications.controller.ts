import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/applications')
export class ApplicationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('applications:read')
  list() {
    return this.prisma.application.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }
}
