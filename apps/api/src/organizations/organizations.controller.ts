import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/organizations')
export class OrganizationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('entities:read')
  list() {
    return this.prisma.organization.findMany({
      include: { entities: { include: { sites: true } } },
    });
  }
}
