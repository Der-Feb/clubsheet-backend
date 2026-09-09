import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Membership } from '@generated/prisma-nestjs-graphql/membership/membership.model';
import { CreateMembershipInput, MyMembershipOutput } from './membership.dto';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import {
  ActiveMembershipGuard,
  TActiveMembershipPayload,
} from '@common/guards/active-membership.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import {
  CurrentMembership,
  CurrentUser,
} from '@common/decorators/current-user';
import { TUserJWTPayload } from '@iam/auth/strategy/jwt.strategy';
import { Request } from 'express';
import { getRequestFromContext } from '@common/utils/request-context.util';
import { ExecutionContext } from '@nestjs/common';

@Resolver(() => Membership)
@UseGuards(
  PassportJwtGuard,
  EmailVerifiedGuard,
  ActiveMembershipGuard,
  PermissionsGuard,
)
export class MembershipResolver {
  constructor(private readonly membershipService: MembershipService) {}

  @Query(() => MyMembershipOutput, { name: 'myMembership', nullable: true })
  getMyMembership(
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
    @CurrentUser() currentUser: TUserJWTPayload,
  ) {
    if (!currentMembership) return null;
    return new MyMembershipOutput(
      currentMembership,
      (currentMembership as any).effectivePermissions || [],
    );
  }

  @Mutation(() => Membership, { name: 'createMembership' })
  @RequirePermissions(true, ['MEMBERSHIP_WRITE'])
  async createMembership(
    @Args('input') input: CreateMembershipInput,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return this.membershipService.createMembership(
      input.personId,
      currentMembership.clubId,
      input.type,
    );
  }

  @Mutation(() => Membership, { name: 'suspendMembership' })
  @RequirePermissions(true, ['MEMBERSHIP_SUSPEND'])
  async suspendMembership(
    @Args('membershipId') membershipId: string,
    @CurrentUser() currentUser: TUserJWTPayload,
  ) {
    return this.membershipService.suspendMembership(
      membershipId,
      currentUser.user_id,
    );
  }
}
