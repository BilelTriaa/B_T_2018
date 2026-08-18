import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentClassification, DocumentStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { EntityScopeGuard } from '../common/guards/entity-scope.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/auth.types';

class CreateDocumentDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsEnum(DocumentClassification) classification?: DocumentClassification;
  @IsOptional() @IsEnum(DocumentStatus) status?: DocumentStatus;
}

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, EntityScopeGuard)
@Controller('api/v1/documents')
export class DocumentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get()
  @RequirePermissions('documents:read')
  list(@CurrentUser() user: AuthenticatedUser) {
    const where =
      user.scopeType === 'GROUP' ? {} : { entityId: { in: user.entityIds } };
    return this.prisma.document.findMany({
      where,
      include: { owner: { select: { id: true, fullName: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Post()
  @RequirePermissions('documents:write')
  async create(@Body() dto: CreateDocumentDto, @CurrentUser() user: AuthenticatedUser) {
    const doc = await this.prisma.document.create({
      data: {
        title: dto.title,
        description: dto.description,
        entityId: dto.entityId,
        classification: dto.classification ?? DocumentClassification.INTERNAL,
        status: dto.status ?? DocumentStatus.DRAFT,
        ownerId: user.id,
      },
    });

    await this.auditLog.log({
      userId: user.id,
      username: user.username,
      role: user.roles[0],
      entityId: dto.entityId,
      action: 'DOCUMENT_CREATED',
      resourceType: 'document',
      resourceId: doc.id,
      newValue: { title: doc.title, status: doc.status },
    });

    return doc;
  }
}
