import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamResolver } from './team.resolver';
import { AuditLogsModule } from '@infrastructure/audit-logs/audit-logs.module';
import { AuthModule } from '@iam/auth/auth.module';

@Module({
  imports: [AuditLogsModule, AuthModule],
  providers: [TeamService, TeamResolver],
  exports: [TeamService],
})
export class TeamModule {}
