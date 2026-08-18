import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
