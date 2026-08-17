import { Module } from '@nestjs/common';
import { UserTokenService } from './user-token.service';
import { AuditLogsModule } from '@infrastructure/audit-logs/audit-logs.module';
import { CommunicationModule } from '@infrastructure/communication/communication.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    CommunicationModule,
    AuditLogsModule,
  ],
  providers: [UserTokenService],
  exports: [UserTokenService]
})
export class UserTokenModule {}
