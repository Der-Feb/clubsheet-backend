import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AuditLogsService } from '@infrastructure/audit-logs/audit-logs.service';
import { TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { CreateCoachProfileDto, CreatePlayerProfileDto, CreateProfileDto } from './profile.dto';
import { isInstance } from 'class-validator';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  public async createProfile(membership: TActiveMembershipPayload, profileData?: CreateProfileDto) {
    // check if the person already has a profile
    const existingProfile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });
    if (existingProfile) {
      throw new BadRequestException('Profile already exists for this person');
    }

    // create the profile first
    return await this.prisma.profile.create({
      data: {
        personId: membership.personId,
        ...profileData,
      },
    });
  }

  public async createPlayerProfile(
    membership: TActiveMembershipPayload, 
    playerData: CreatePlayerProfileDto,
    profileData?: CreateProfileDto
  ) {
    // check if the player has a profile already
    const existingProfile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });

    if (!profileData || !isInstance(profileData, CreateProfileDto) ) {
      throw new BadRequestException('Profile data is missing or invalid');
    }

    // create the profile first
    const profile = await this.createProfile(membership, profileData);

    // create the player profile
    return await this.prisma.playerProfile.create({
      data: {
        profileId: profile.id,
        ...playerData,
      },
    });
  }

  public async createCoachProfile(
    membership: TActiveMembershipPayload, 
    coachData: CreateCoachProfileDto,
    profileData?: CreateProfileDto
  ) {
    // check if the coach has a profile already
    const existingProfile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });

    if (!profileData || !isInstance(profileData, CreateProfileDto) ) {
      throw new BadRequestException('Profile data is missing or invalid');
    }

    // create the profile first
    const profile = await this.createProfile(membership, profileData);

    // create the coach profile
    return await this.prisma.coachProfile.create({
      data: {
        profileId: profile.id,
        ...coachData,
      },
    });
  }

  public async getProfile(personId: string) {
    return await this.prisma.profile.findFirst({
      where: { personId },
      include: {
        playerProfile: true,
        coachProfile: true,
      }
    });
  }
}
