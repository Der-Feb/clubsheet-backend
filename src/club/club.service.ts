import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubDto } from './club.dto';
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found';
import { ENClubStatus, ENMembershipType } from '@prisma/client';

@Injectable()
export class ClubService {
    constructor (
        private readonly auditLogsService: AuditLogsService,
        private readonly prisma: PrismaService,
    ){}

    public async createClub(
        createClubDto: CreateClubDto,
        userId: string,
        type: ENMembershipType // the type of the membership
    ) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                person: {
                    include: { memberships: true }
                }
            }
        });

        if (!user) throw new ResourceNotFoundException("User not found", "user");

        // check if the user has other membership which are still active
        const hasOtherOpenMembership = user.person.memberships.some(m => m.status === ENClubStatus.ACTIVE);
        if (hasOtherOpenMembership) 
            throw new ConflictException("User already has other active membership");

        // creating the club and new membership of the own
        return await this.prisma.$transaction(async(tx) => {
            const club = await tx.club.create({
                data: {
                    name: createClubDto.name,
                    shortName: createClubDto.shortName,
                    logo: createClubDto.logo,
                    country: createClubDto.country,
                    status: ENClubStatus.ACTIVE,
                }
            });

            // create the membership of the creator
            const ownerMembership = await tx.membership.create({
                data: {
                    type: type,
                    clubId: club.id,
                    joinedAt: new Date(),
                    personId: user.person.id,
                }
            });

            const finalizedClub = await tx.club.update({
                where: { id: club.id },
                data: { createdById: ownerMembership.id }
            });

            return {
                success: true,
                message: "Club created successfully with membership",
            }
        })
    }
}
