import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { AuditLogsModule } from '@infrastructure/audit-logs/audit-logs.module';
import { AuthModule } from '@iam/auth/auth.module';

@Module({
  imports: [AuditLogsModule, AuthModule],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
