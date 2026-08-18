import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedUser } from '../types/auth.types';

@Injectable()
export class EntityScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    if (!user) throw new ForbiddenException('Authentication required');

    if (
      user.scopeType === 'GROUP' ||
      user.roles.includes('group-administrator') ||
      user.roles.includes('plant-administrator')
    ) {
      return true;
    }

    const entityId =
      request.params?.entityId ||
      request.query?.entityId ||
      request.body?.entityId;

    if (!entityId) return true;

    if (user.scopeType === 'ENTITY' && !user.entityIds.includes(entityId)) {
      throw new ForbiddenException('Access denied for this entity');
    }

    const siteId = request.params?.siteId || request.query?.siteId;
    if (siteId && user.scopeType === 'SITE' && !user.siteIds.includes(siteId)) {
      throw new ForbiddenException('Access denied for this site');
    }

    return true;
  }
}
