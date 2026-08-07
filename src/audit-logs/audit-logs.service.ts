import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateAuditDescription } from './audit.utils';
import { ENAuditCategory } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(params: {
    category: ENAuditCategory;
    action: string;
    entityType: string;
    metadata: Record<string, any>;
    createdBy?: string;
    description?: string;
  }) {
    const { category, action, entityType, metadata, createdBy } = params;

    const description = params.description ?? generateAuditDescription(action, metadata);

    return await this.prisma.auditLog.create({
      data: {
        category,
        action,
        entityType,
        description,
        metadata,
        createdBy,
      },
    });
  }
}