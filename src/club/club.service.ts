import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubDto, UpdateClubDto } from './club.dto';
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found';
import { ENAuditCategory, ENClubStatus, ENMembershipStatus, ENMembershipType } from '@prisma/client';
import { TPayload } from '../auth/auth.types';

@Injectable()
export class ClubService {
    constructor (
        private readonly auditLogsService: AuditLogsService,
        private readonly prisma: PrismaService,
    ){}

    /**
     * Generates a short abbreviation/acronym from a full club name.
     * 
     * Examples:
     * - "Manchester United" -> "MU"
     * - "Real Madrid Football Club" -> "RMFC"
     * - "Arsenal" -> "ARS"
     * - "FC Barcelona" -> "FCB"
     * - "A" -> "A"
     */
    private generateShortName(name: string, maxLen: number = 4): string {
        if (!name || !name.trim()) return '';

        // Clean extra spaces and extract words ignoring special chars
        const words = name
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .filter((word) => word.length > 0);

        if (words.length === 0) return 'CLUB';

        // Multi-word name: Take the first letter of each word
        if (words.length > 1) {
            return words
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, maxLen);
        }

        // Single word: Take up to 3 chars (e.g., "Arsenal" -> "ARS")
        const singleWord = words[0];
        if (singleWord.length <= 3) {
            return singleWord.toUpperCase();
        }

        return singleWord.slice(0, 3).toUpperCase();
    }

    public async createClub(
        createClubDto: CreateClubDto,
        userId: string,
    ) {
        try {
            
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
                        shortName: createClubDto.shortName ?? this.generateShortName(createClubDto.name),
                        logo: createClubDto.logo,
                        country: createClubDto.country,
                        status: ENClubStatus.ACTIVE,
                    }
                });
    
                // Ensure OWNER type is present alongside any types passed in DTO
                const uniqueTypes = Array.from(
                    new Set([ENMembershipType.OWNER, ...createClubDto.membershipTypes])
                );
    
                // create the membership of the creator
                const ownerMembership = await tx.membership.create({
                    data: {
                        clubId: club.id,
                        joinedAt: new Date(),
                        personId: user.person.id,
                        types: {
                            create: uniqueTypes.map(type => ({ type: type }))
                        }
                    },
                    include: {
                        types: true
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
            });
        } catch (error) {
            console.log(error);
        }
    }

    public async updateClub(data: UpdateClubDto, user_id: string, person_id: string) {
        // 1. Find the active membership for this user/person and include the club
        const membership = await this.prisma.membership.findFirst({
            where: {
                status: ENMembershipStatus.ACTIVE,
                person: {
                    id: person_id,
                    user: { id: user_id }
                }
            },
            include: {
                club: true,
                types: true,
            }
        });

        if (!membership || !membership.club)
            throw new ResourceNotFoundException("No club found for this user", "club");

        const club = membership.club;
        const updatedClub = await this.prisma.club.update({
            where: { id: club.id }, data: { ...data }
        });

        // Create audit log with membership ID included
        await this.auditLogsService.createLog({
            category: ENAuditCategory.CLUB,
            action: "updateClub",
            entityType: "Club",
            description: "Updating the club details",
            metadata: { 
                userId: user_id, 
                personId: person_id, 
                membershipId: membership.id,
                clubId: club.id 
            },
            createdBy: user_id
        });

        return {
            success: true,
            message: "Club updated successfully",
            data: updatedClub,
        };
    }
}
