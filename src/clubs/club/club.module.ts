import { Module } from '@nestjs/common';
import { AuditLogsModule } from '@infrastructure/audit-logs/audit-logs.module';
import { ClubService } from './club.service';
import { ClubResolver } from './club.resolver';
import { AuthModule } from '@iam/auth/auth.module';

@Module({
  imports: [AuditLogsModule, AuthModule],
  providers: [ClubService, ClubResolver],
  exports: [ClubService],
})
export class ClubModule {}
