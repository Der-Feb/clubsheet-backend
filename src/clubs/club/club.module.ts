import { Module } from '@nestjs/common';
import { AuditLogsModule } from '@infrastructure/audit-logs/audit-logs.module';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { AuthModule } from '@iam/auth/auth.module';

@Module({
    imports: [
        AuditLogsModule,
        AuthModule
    ],
    providers: [ClubService],
    controllers: [ClubController]
})
export class ClubModule {}
