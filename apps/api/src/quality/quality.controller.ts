import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('quality')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/quality')
export class QualityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('ncrs')
  @RequirePermissions('quality:read')
  list() {
    return this.prisma.qualityRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
