import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { Team } from '@generated/prisma-nestjs-graphql/team/team.model';
import { CreateTeamInput, UpdateTeamInput } from './team.dto';
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

@Resolver(() => Team)
@UseGuards(
  PassportJwtGuard,
  EmailVerifiedGuard,
  ActiveMembershipGuard,
  PermissionsGuard,
)
export class TeamResolver {
  constructor(private readonly teamService: TeamService) {}

  @Query(() => [Team], { name: 'clubTeams' })
  @RequirePermissions(true, ['TEAM_READ'])
  async getClubTeams(
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return this.teamService.getTeamList(currentMembership);
  }

  @Query(() => Team, { name: 'team', nullable: true })
  @RequirePermissions(true, ['TEAM_READ'])
  async getTeamById(
    @Args('teamId') teamId: string,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return this.teamService.getTeamById(currentMembership, teamId);
  }

  @Mutation(() => Team, { name: 'createTeam' })
  @RequirePermissions(true, ['TEAM_WRITE'])
  async createTeam(
    @Args('input') input: CreateTeamInput,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
    @CurrentUser() currentUser: TUserJWTPayload,
  ) {
    return this.teamService.createTeam(
      currentMembership,
      input.name,
      currentUser.user_id,
    );
  }

  @Mutation(() => Team, { name: 'updateTeam' })
  @RequirePermissions(true, ['TEAM_WRITE'])
  async updateTeam(
    @Args('teamId') teamId: string,
    @Args('input') input: UpdateTeamInput,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
    @CurrentUser() currentUser: TUserJWTPayload,
  ) {
    return this.teamService.updateTeam(
      currentMembership,
      teamId,
      input.name,
      currentUser.user_id,
    );
  }
}
