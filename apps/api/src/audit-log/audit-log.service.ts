import { Injectable } from '@nestjs/common';
import { AuditResult } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

export interface AuditEventInput {
  userId?: string;
  username?: string;
  role?: string;
  entityId?: string;
  siteId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  result?: AuditResult;
  reason?: string;
  correlationId?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(event: AuditEventInput) {
    return this.prisma.auditLog.create({
      data: {
        userId: event.userId,
        username: event.username,
        role: event.role,
        entityId: event.entityId,
        siteId: event.siteId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        oldValue: event.oldValue as object | undefined,
        newValue: event.newValue as object | undefined,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        result: event.result ?? AuditResult.SUCCESS,
        reason: event.reason,
        correlationId: event.correlationId,
      },
    });
  }
}
