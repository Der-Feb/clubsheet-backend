import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionResolver } from './permission.resolver';
import { AuditLogsModule } from '@infrastructure/audit-logs/audit-logs.module';
import { AuthModule } from '@iam/auth/auth.module';

@Module({
  imports: [AuditLogsModule, AuthModule],
  providers: [PermissionService, PermissionResolver],
  exports: [PermissionService],
})
export class PermissionModule {}
