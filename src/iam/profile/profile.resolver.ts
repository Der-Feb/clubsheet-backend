import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from '@generated/prisma-nestjs-graphql/profile/profile.model';
import {
  CreateCoachAndProfileInput,
  CreateAthleteAndProfileInput,
  CreateProfileInput,
} from './profile.dto';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import {
  ActiveMembershipGuard,
  TActiveMembershipPayload,
} from '@common/guards/active-membership.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentMembership } from '@common/decorators/current-user';

@Resolver(() => Profile)
@UseGuards(
  PassportJwtGuard,
  EmailVerifiedGuard,
  ActiveMembershipGuard,
  PermissionsGuard,
)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { name: 'myProfile', nullable: true })
  async getMyProfile(
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return this.profileService.getProfile(currentMembership.personId);
  }

  @Query(() => Profile, { name: 'profile', nullable: true })
  @RequirePermissions(true, ['PROFILE_READ'])
  async getProfileById(@Args('personId') personId: string) {
    return this.profileService.getProfile(personId);
  }

  @Mutation(() => Profile, { name: 'createProfile' })
  async createProfile(
    @Args('input') input: CreateProfileInput,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return this.profileService.createProfile(currentMembership, input);
  }

  @Mutation(() => Profile, { name: 'createAthleteProfile' })
  async createAthleteProfile(
    @Args('input') input: CreateAthleteAndProfileInput,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return this.profileService.createAthleteProfile(
      currentMembership,
      input.athleteProfile,
      input.profile,
    );
  }

  @Mutation(() => Profile, { name: 'createCoachProfile' })
  async createCoachProfile(
    @Args('input') input: CreateCoachAndProfileInput,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return this.profileService.createCoachProfile(
      currentMembership,
      input.coachProfile,
      input.profile,
    );
  }
}
