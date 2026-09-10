import { ResourceNotFoundException } from '@common/exceptions/resource-not-found';
import { parsePrismaError } from '@common/utils/error-handler';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ENMembershipStatus,
  ENMembershipType,
  ENAuditCategory,
} from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AuditLogsService } from '@infrastructure/audit-logs/audit-logs.service';
import { TActiveMembershipPayload } from '@common/guards/active-membership.guard';

@Injectable()
export class MembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly AuditLogService: AuditLogsService,
  ) {}

  public async createMembership(
    personId: string,
    clubId: string,
    types: ENMembershipType[],
  ) {
    const personExists = await this.prisma.person.findUnique({
      where: { id: personId },
    });
    if (!personExists)
      throw new ResourceNotFoundException(
        `Person '${personId}' not found`,
        'Person',
      );

    const clubExists = await this.prisma.club.findUnique({
      where: { id: clubId },
    });
    if (!clubExists)
      throw new ResourceNotFoundException(`Club '${clubId}' not found`, 'Club');

    const existingActiveMembership = await this.prisma.membership.findFirst({
      where: {
        personId,
        clubId,
        status: ENMembershipStatus.ACTIVE,
      },
    });
    if (existingActiveMembership) {
      throw new ConflictException(
        `Person '${personId}' already has an active membership in this club.`,
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdMembership = await tx.membership.create({
          data: {
            personId,
            clubId,
            joinedAt: new Date(),
            types: {
              create: types.map((type) => ({ type })),
            },
          },
          include: { types: true },
        });

        await this.AuditLogService.createLog(
          {
            category: ENAuditCategory.MEMBERSHIP,
            action: 'CREATE',
            entityType: 'Membership',
            description: 'Membership created successfully.',
            metadata: {
              membershipId: createdMembership.id,
              personId,
              clubId,
              types,
            },
          },
          tx,
        );

        return createdMembership;
      });
    } catch (error) {
      throw new InternalServerErrorException(parsePrismaError(error));
    }
  }

  public async endMembership(
    membershipId: string,
    actingMembership: TActiveMembershipPayload,
  ) {
    const targetMembership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
    });
    if (!targetMembership) {
      throw new ResourceNotFoundException(
        `Membership '${membershipId}' not found`,
        'Membership',
      );
    }

    if (targetMembership.clubId !== actingMembership.clubId) {
      throw new ForbiddenException(
        'Acting admin has no authority over a membership in a different club.',
      );
    }

    if (targetMembership.status === ENMembershipStatus.ENDED) {
      throw new ConflictException('Membership has already ended.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const membershipUpdate = await tx.membership.update({
          where: { id: membershipId },
          data: {
            status: ENMembershipStatus.ENDED,
            endedAt: new Date(),
          },
        });

        await tx.player.updateMany({
          where: { membershipId, leftAt: null },
          data: { leftAt: new Date() },
        });

        await this.AuditLogService.createLog(
          {
            category: ENAuditCategory.MEMBERSHIP,
            action: 'END',
            entityType: 'Membership',
            description: 'Membership ended successfully.',
            metadata: { membershipId, clubId: targetMembership.clubId },
            createdBy: actingMembership.person?.user?.id,
          },
          tx,
        );

        return membershipUpdate;
      });
    } catch (error) {
      throw new InternalServerErrorException(parsePrismaError(error));
    }
  }
}
