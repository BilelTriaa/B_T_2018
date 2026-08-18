import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../types/auth.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest().user as AuthenticatedUser;
    if (!user) throw new ForbiddenException('Authentication required');

    if (user.roles.includes('group-administrator') || user.roles.includes('plant-administrator')) {
      return true;
    }

    const userPermissions = this.resolvePermissions(user.roles);
    const hasPermission = required.some((p) =>
      userPermissions.some(
        (up) => up === '*' || up === p || (up.endsWith(':*') && p.startsWith(up.slice(0, -1))),
      ),
    );
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }

  private resolvePermissions(roles: string[]): string[] {
    const map: Record<string, string[]> = {
      'group-administrator': ['*'],
      'plant-administrator': ['*'],
      'production-manager': [
        'dashboard:read',
        'production:read',
        'applications:read',
        'entities:read',
        'documents:read',
      ],
      'quality-manager': [
        'dashboard:read',
        'quality:read',
        'documents:*',
        'applications:read',
        'entities:read',
      ],
      'it-applications': [
        'dashboard:read',
        'applications:read',
        'users:read',
        'entities:read',
        'audit:read',
      ],
      'group-ciso': ['dashboard:read', 'entities:read', 'audit:read', 'documents:read'],
      'group-isms-manager': ['isms:*', 'entities:read', 'documents:*', 'audit:read'],
      'entity-security-officer': ['entities:read', 'documents:*', 'audit:read', 'dashboard:read'],
      'site-security-officer': ['entities:read', 'documents:read'],
      auditor: ['audit:read', 'documents:read', 'entities:read'],
      management: ['dashboard:read', 'entities:read', 'applications:read'],
      contributor: ['documents:write', 'entities:read'],
      viewer: ['entities:read', 'documents:read', 'dashboard:read', 'applications:read'],
    };

    const perms = new Set<string>();
    for (const role of roles) {
      (map[role] ?? []).forEach((p) => perms.add(p));
    }
    return [...perms];
  }
}
