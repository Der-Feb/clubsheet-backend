import { Body, Controller, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { ActiveMembershipGuard, TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { CurrentMembership, CurrentUser } from '@common/decorators/current-user';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { ParseCuidPipe } from '@common/pipes/cuid-pipe';
import { CreateTeamDto } from './team.dto';
import { TUserJWTPayload } from '../../auth/strategy/jwt.strategy';

@Controller('team')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @RequirePermissions(true, ["TEAM_READ"])
  public async getClubTeams(
    @CurrentMembership() adminMembership: TActiveMembershipPayload
  ) {
    return await this.teamService.getTeamList(adminMembership);
  }

  @Get(':team_id')
  @RequirePermissions(true, ["TEAM_READ"])
  public async getTeamDetail(
    @Param('team_id', ParseCuidPipe) team_id: string,
    @CurrentMembership() adminMembership: TActiveMembershipPayload
  ) {
    return await this.teamService.getTeamById(adminMembership, team_id);
  }

  @Post()
  @RequirePermissions(true, ["TEAM_WRITE"])
  public async createTeam(
    @CurrentMembership() adminMembership: TActiveMembershipPayload,
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() currentUser: TUserJWTPayload
  ) {
    return await this.teamService.createTeam(adminMembership, createTeamDto.team, currentUser.user_id);
  }

  @Patch(':team_id')
  @RequirePermissions(true, ["TEAM_WRITE"])
  public async updateTeam(
    @Param('team_id', ParseCuidPipe) teamId: string,
    @CurrentMembership() adminMembership: TActiveMembershipPayload,
    @Body() updateTeamDto: CreateTeamDto,
    @CurrentUser() currentUser: TUserJWTPayload
  ) {
    return await this.teamService.updateTeam(
      adminMembership, teamId, 
      updateTeamDto.team, 
      currentUser.user_id
    );
  }
}
