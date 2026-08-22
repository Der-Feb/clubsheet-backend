import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CommunicationModule } from '@infrastructure/communication/communication.module';
import { AuditLogsModule } from '@infrastructure/audit-logs/audit-logs.module';
import { InvitationController } from './invitation.controller';

@Module({
  imports: [
    CommunicationModule,
    AuditLogsModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService]
})
export class InvitationModule {}
