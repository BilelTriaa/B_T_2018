import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtPayload, AuthenticatedUser } from '../common/types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'otto-dev-secret-change-me'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: { include: { role: true } },
        entityScopes: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }

    const roles = user.userRoles.map((ur) => ur.role.slug);
    const entityIds = user.entityScopes
      .map((s) => s.entityId)
      .filter((id): id is string => !!id);
    const siteIds = user.entityScopes
      .map((s) => s.siteId)
      .filter((id): id is string => !!id);
    const hasGroupScope = user.entityScopes.some((s) => s.scopeType === 'GROUP');

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      roles,
      entityIds,
      siteIds,
      scopeType: hasGroupScope ? 'GROUP' : siteIds.length > 0 ? 'SITE' : 'ENTITY',
    };
  }
}
