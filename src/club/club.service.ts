import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubService {
    constructor (
        private readonly auditLogsService: AuditLogsService,
        private readonly prisma: PrismaService,
    ){}

    public createClub() {}
}
