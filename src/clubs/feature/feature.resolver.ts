import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ActiveMembershipGuard, TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { FeatureService } from './feature.service';
import { ClubFeature } from '@generated/prisma-nestjs-graphql/club-feature/club-feature.model';
import { Feature } from '@generated/prisma-nestjs-graphql/feature/feature.model';
import { CurrentMembership } from '@common/decorators/current-user';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { ENFeature as GQLENFeature } from '@generated/prisma-nestjs-graphql/prisma/en-feature.enum';
import { ParseCuidPipe } from '@common/pipes/cuid-pipe';

@Resolver(() => ClubFeature)
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard)
export class FeatureResolver {
  constructor(private readonly featureService: FeatureService) {}

  @Query(() => [Feature])
  public async getFeatures() {
    return await this.featureService.getFeatures();
  }

  @Query(() => ClubFeature, { nullable: true })
  public async getFeature(
    @Args('featureId', ParseCuidPipe) featureId: string,
    @CurrentMembership() membership: TActiveMembershipPayload
  ) {
    return await this.featureService.getFeature(membership.clubId, featureId);
  }

  @Query(() => [ClubFeature])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(true, ['CLUB_READ'])
  public async getClubFeatures(
    @CurrentMembership() membership: TActiveMembershipPayload
  ) {
    return await this.featureService.getClubFeatures(membership.clubId);
  }

  @Mutation()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(true, ['CLUB_WRITE'])
  public async enableFeature(
    @Args('featureCode', { type: () => GQLENFeature }) featureCode: GQLENFeature,
    @CurrentMembership() membership: TActiveMembershipPayload,
  ) {
    return await this.featureService.enableFeature(featureCode, membership);
  }

  @Mutation(() => ClubFeature)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(true, ['CLUB_WRITE'])
  public async disableFeature(
    @Args('featureCode', { type: () => GQLENFeature }) featureCode: GQLENFeature,
    @CurrentMembership() membership: TActiveMembershipPayload,
  ) {
    return await this.featureService.disableFeature(featureCode, membership);
  }
}
