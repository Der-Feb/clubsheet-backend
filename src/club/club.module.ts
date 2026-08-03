import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';

@Module({
    imports: [AuditLogsModule],
    providers: [ClubService],
    controllers: [ClubController]
})
export class ClubModule {}
