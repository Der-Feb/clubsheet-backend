import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ENMembershipStatus } from '@prisma/client';
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found';

@Injectable()
export class MembershipService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    // revoke any active membership that a user has
    // The user in the system has only one active membership per club
    public async revokeActiveMembershipOfClub(user_id: string, person_id: string, club_id: string) {
        const membership = await this.prisma.membership.findFirst({
            where: {
                personId: person_id,
                clubId: club_id,
                person: { user: { id: user_id } },
            },
            select: { id: true },
        });

        if (!membership)
            throw new ResourceNotFoundException('Active membership not found', 'Membership');

        await this.prisma.membership.update({
            where: { id: membership.id },
            data: {
                status: ENMembershipStatus.SUSPENDED,
            },
        });
    }
}
