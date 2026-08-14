import { Query, Resolver } from '@nestjs/graphql';
import { MembershipService } from './membership.service';
import { ActiveMembershipGuard } from '@common/guards/active-membership.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { CurrentMembership } from '@common/decorators/current-membership';
import { UseGuards } from '@nestjs/common';
import { Membership as MembershipType } from '@generated/membership/membership.model';

@Resolver(() => MembershipType)
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard)
export class MembershipsResolver {

  constructor(
    private readonly membershipService: MembershipService,
  ) {}

  @Query(() => MembershipType)
  async myMembership(@CurrentMembership() membership: MembershipType) {
    return membership;
  }
}