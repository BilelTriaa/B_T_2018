import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthenticatedUser, JwtPayload } from '../common/types/auth.types';
import { AuditResult } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLog: AuditLogService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: { include: { role: true } },
        entityScopes: true,
      },
    });

    if (!user || user.status !== 'ACTIVE' || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.toAuthenticatedUser(user);
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    try {
      const user = await this.validateUser(email, password);
      const token = this.jwtService.sign(this.toPayload(user));

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await this.auditLog.log({
        userId: user.id,
        username: user.username,
        role: user.roles[0],
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: ip,
        userAgent,
        result: AuditResult.SUCCESS,
      });

      return { accessToken: token, user };
    } catch (error) {
      await this.auditLog.log({
        username: email,
        action: 'USER_LOGIN',
        resourceType: 'user',
        ipAddress: ip,
        userAgent,
        result: AuditResult.FAILURE,
        reason: 'Invalid credentials',
      });
      throw error;
    }
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        entityScopes: true,
      },
    });
    return this.toAuthenticatedUser(user);
  }

  private toPayload(user: AuthenticatedUser): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
      entityIds: user.entityIds,
      siteIds: user.siteIds,
      scopeType: user.scopeType,
    };
  }

  private toAuthenticatedUser(user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    userRoles: { role: { slug: string } }[];
    entityScopes: { scopeType: string; entityId: string | null; siteId: string | null }[];
  }): AuthenticatedUser {
    const roles = user.userRoles.map((ur) => ur.role.slug);
    const entityIds = user.entityScopes
      .map((s) => s.entityId)
      .filter((id): id is string => !!id);
    const siteIds = user.entityScopes
      .map((s) => s.siteId)
      .filter((id): id is string => !!id);

    const hasGroupScope = user.entityScopes.some((s) => s.scopeType === 'GROUP');
    const scopeType = hasGroupScope
      ? 'GROUP'
      : siteIds.length > 0
        ? 'SITE'
        : 'ENTITY';

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      roles,
      entityIds,
      siteIds,
      scopeType,
    };
  }
}
