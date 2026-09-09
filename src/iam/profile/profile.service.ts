import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AuditLogsService } from '@infrastructure/audit-logs/audit-logs.service';
import { TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import {
  CreateCoachProfileDto,
  CreatePlayerProfileDto,
  CreateProfileDto,
} from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  public async createProfile(
    membership: TActiveMembershipPayload,
    profileData?: CreateProfileDto,
  ) {
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
      include: {
        playerProfile: true,
        coachProfile: true,
      },
    });
  }

  public async createPlayerProfile(
    membership: TActiveMembershipPayload,
    playerData: CreatePlayerProfileDto,
    profileData?: CreateProfileDto,
  ) {
    // check if the player has a profile already
    let profile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });

    if (!profile) {
      if (!profileData) {
        throw new BadRequestException('Profile data is required');
      }
      profile = await this.createProfile(membership, profileData);
    }

    // create the player profile
    await this.prisma.playerProfile.create({
      data: {
        profileId: profile.id,
        ...playerData,
      },
    });

    return await this.getProfile(membership.personId);
  }

  public async createCoachProfile(
    membership: TActiveMembershipPayload,
    coachData: CreateCoachProfileDto,
    profileData?: CreateProfileDto,
  ) {
    // check if the coach has a profile already
    let profile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });

    if (!profile) {
      if (!profileData) {
        throw new BadRequestException('Profile data is required');
      }
      profile = await this.createProfile(membership, profileData);
    }

    // create the coach profile
    await this.prisma.coachProfile.create({
      data: {
        profileId: profile.id,
        ...coachData,
      },
    });

    return await this.getProfile(membership.personId);
  }

  public async getProfile(personId: string) {
    return await this.prisma.profile.findFirst({
      where: { personId },
      include: {
        playerProfile: true,
        coachProfile: true,
      },
    });
  }
}
