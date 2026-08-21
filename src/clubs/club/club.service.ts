import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuditLogsService } from '@infrastructure/audit-logs/audit-logs.service';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateClubDto, UpdateClubDto } from './club.dto';
import { ResourceNotFoundException } from '@common/exceptions/resource-not-found';
import { ENAuditCategory, ENClubStatus, ENMembershipStatus, ENMembershipType } from '@prisma/client';
import { parsePrismaError } from '@common/utils/error-handler';
import { TActiveMembershipPayload } from '@common/guards/active-membership.guard';

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
                    person: true
                }
            });
    
            if (!user) throw new ResourceNotFoundException("User not found", "user");
    
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
                        },
                        status: ENMembershipStatus.ACTIVE
                    },
                    include: {
                        types: true
                    }
                });

                // Get the ADMIN role
                const adminRole = await tx.role.findUnique({
                    where: { code: 'ADMIN' }
                });

                // Assign ADMIN role to the club creator
                if (adminRole) {
                    await tx.membershipRole.create({
                        data: {
                            membershipId: ownerMembership.id,
                            roleId: adminRole.id
                        }
                    });

                    // Sync all permissions from ADMIN role to the membership
                    const adminPermissions = await tx.rolePermission.findMany({
                        where: { roleId: adminRole.id }
                    });

                    if (adminPermissions.length > 0) {
                        const result = await tx.membershipPermission.createMany({
                            data: adminPermissions.map(rp => ({
                                membershipId: ownerMembership.id,
                                permissionId: rp.permissionId,
                                scope: rp.scope
                            }))
                        });
                    }
                }
    
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
            console.error('Club creation error:', error);
            throw error;
        }
    }

    public async updateClub(data: UpdateClubDto, membership: TActiveMembershipPayload) {
        // 1. Find the active membership for this user/person and include the club
        if (!membership || !membership.club)
            throw new ResourceNotFoundException("No club found for this user", "club");

        const club = membership.club;
        const updatedClub = await this.prisma.club.update({
            where: { id: club.id }, data: { ...data }
        });

        // Create audit log with membership ID included
        await this.auditLogsService.createLog({
            category: ENAuditCategory.CLUB as ENAuditCategory,
            action: "updateClub",
            entityType: "Club",
            description: "Updating the club details",
            metadata: { 
                userId: membership.person.user?.id, 
                personId: membership.personId, 
                membershipId: membership.id,
                clubId: club.id 
            },
            createdBy: membership.person.user?.id
        });

        return {
            success: true,
            message: "Club updated successfully",
            data: updatedClub,
        };
    }

    public async myClubs(personId: string) {
        try {
            return await this.prisma.club.findMany({
                where: {
                    memberships: { 
                        some: { 
                            personId,
                            status: ENMembershipStatus.ACTIVE,
                        } 
                    }
                }
            });
        } catch (error) {
            throw new InternalServerErrorException(parsePrismaError(error));
        }
    }

    /**
     * The permission is to club.delete
     * @param membershipId 
     * @param clubId 
     */
    public async archiveClub(clubId: string, membershipId: string) {
        await this.prisma.club.update({
            where: {
                id: clubId,
            },
            data: {
                status: ENClubStatus.DELETED,
                memberships: {
                    updateMany: {
                        where: {},
                        data: { status: ENMembershipStatus.SUSPENDED },
                    }
                }
            }
        });

        await this.auditLogsService.createLog({
            category: ENAuditCategory.CLUB,
            action: "clubArchive",
            metadata: { clubId, membershipId },
            entityType: 'club',
        });
    }

    public async getClub(clubId: string) {
        
    }
}
