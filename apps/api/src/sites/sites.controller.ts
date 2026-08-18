import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { EntityScopeGuard } from '../common/guards/entity-scope.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/auth.types';

class CreateSiteDto {
  @IsString() entityId: string;
  @IsString() name: string;
  @IsString() code: string;
  @IsString() country: string;
}

@ApiTags('sites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, EntityScopeGuard)
@Controller('api/v1/sites')
export class SitesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('entities:read')
  list(@CurrentUser() user: AuthenticatedUser) {
    const where =
      user.scopeType === 'GROUP'
        ? {}
        : user.scopeType === 'SITE'
          ? { id: { in: user.siteIds } }
          : { entityId: { in: user.entityIds } };
    return this.prisma.site.findMany({ where, include: { entity: true } });
  }

  @Post()
  @RequirePermissions('entities:write')
  create(@Body() dto: CreateSiteDto) {
    return this.prisma.site.create({ data: dto });
  }
}
