import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AuditLogsService } from '@infrastructure/audit-logs/audit-logs.service';
import { TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import {
  CreateCoachProfileDto,
  CreateAthleteProfileDto,
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
    const existingProfile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });
    if (existingProfile) {
      throw new BadRequestException('Profile already exists for this person');
    }

    return await this.prisma.profile.create({
      data: {
        personId: membership.personId,
        ...profileData,
      },
      include: {
        athleteProfile: true,
        coachProfile: true,
      },
    });
  }

  public async createAthleteProfile(
    membership: TActiveMembershipPayload,
    athleteData: CreateAthleteProfileDto,
    profileData?: CreateProfileDto,
  ) {
    let profile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });

    if (!profile) {
      if (!profileData) {
        throw new BadRequestException('Profile data is required');
      }
      profile = await this.createProfile(membership, profileData);
    }

    await this.prisma.athleteProfile.create({
      data: {
        profileId: profile.id,
        ...athleteData,
      },
    });

    return await this.getProfile(membership.personId);
  }

  public async createCoachProfile(
    membership: TActiveMembershipPayload,
    coachData: CreateCoachProfileDto,
    profileData?: CreateProfileDto,
  ) {
    let profile = await this.prisma.profile.findFirst({
      where: { personId: membership.personId },
    });

    if (!profile) {
      if (!profileData) {
        throw new BadRequestException('Profile data is required');
      }
      profile = await this.createProfile(membership, profileData);
    }

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
        athleteProfile: true,
        coachProfile: true,
      },
    });
  }
}
