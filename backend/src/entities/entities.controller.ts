import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { EntityScopeGuard } from '../common/guards/entity-scope.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/auth.types';
import { IsOptional, IsString } from 'class-validator';

class CreateEntityDto {
  @IsString() organizationId: string;
  @IsString() name: string;
  @IsString() code: string;
  @IsString() country: string;
  @IsOptional() @IsString() securityOfficerId?: string;
}

@ApiTags('entities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, EntityScopeGuard)
@Controller('api/v1/entities')
export class EntitiesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('entities:read')
  list(@CurrentUser() user: AuthenticatedUser) {
    const where =
      user.scopeType === 'GROUP' ? {} : { id: { in: user.entityIds } };
    return this.prisma.entity.findMany({
      where,
      include: { sites: true, organization: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get(':entityId')
  @RequirePermissions('entities:read')
  getOne(@Param('entityId') entityId: string) {
    return this.prisma.entity.findUniqueOrThrow({
      where: { id: entityId },
      include: { sites: true, departments: true },
    });
  }

  @Post()
  @RequirePermissions('entities:write')
  create(@Body() dto: CreateEntityDto) {
    return this.prisma.entity.create({ data: dto });
  }
}
