import { ResourceNotFoundException } from "@common/exceptions/resource-not-found";
import { parsePrismaError } from "@common/utils/error-handler";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ENMembershipStatus, ENMembershipType } from "@prisma/client";
import { AuditLogsService } from "src/audit-logs/audit-logs.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ENAuditCategory } from '@generated/prisma/en-audit-category.enum';

@Injectable()
export class MembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly AuditLogService: AuditLogsService,
  ) {}

  public async createMembership(
    personId: string,
    clubId: string,
    types: ENMembershipType 
  ) {
    const personExists = await this.prisma.person.findUnique({ where: { id: personId } });
    if (!personExists) 
      throw new ResourceNotFoundException(`Person '${personId}' not found`, 'Person');
    const clubExists = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!clubExists) 
      throw new ResourceNotFoundException(`Club '${clubId}' not found`, 'Club');
    
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.AuditLogService.createLog({
          category: ENAuditCategory.MEMBERSHIP,
          action: 'CREATE',
          entityType: 'Membership',
          description: 'Membership created successfully.',
          metadata: { personId, clubId, types }
        });

        return tx.membership.create({
          data: {
            personId, clubId,
            joinedAt: new Date(),
            types: { create: { type: types } }
          }
        });
      });
    } catch (error) {
      throw new InternalServerErrorException(parsePrismaError(error));
    }
  }

  public async suspendMembership(
    membershipId: string
  ) {
    const membershipUpdate = await this.prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: ENMembershipStatus.SUSPENDED,
      }
    });
    if (!membershipUpdate) 
      throw new ResourceNotFoundException(`Membership '${membershipId}' not found`, 'Membership');
  }
}