import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('users:read')
  list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        status: true,
        lastLoginAt: true,
        userRoles: { include: { role: true } },
        entityScopes: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }
}
