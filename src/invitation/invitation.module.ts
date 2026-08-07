import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CommunicationModule } from '../communication/communication.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    CommunicationModule,
    AuditLogsModule,
  ],
  providers: [InvitationService]
})
export class InvitationModule {}
