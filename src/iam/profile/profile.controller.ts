import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { ActiveMembershipGuard, TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { CurrentMembership } from '@common/decorators/current-user';
import { ParseCuidPipe } from '@common/pipes/cuid-pipe';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CreateCoachAndProfileDto, CreatePlayerAndProfileDto, CreateProfileDto } from './profile.dto';

@Controller('profile')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  public async getProfile(
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return await this.profileService.getProfile(currentMembership.personId);
  }

  @Get(':personId')
  @RequirePermissions(true, ['PROFILE_READ'])
  public async getProfileById(
    @Param('personId', ParseCuidPipe) personId: string,
  ) {
    return await this.profileService.getProfile(personId);
  }

  @Post('create')
  public async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return await this.profileService.createProfile(currentMembership, createProfileDto);
  }

  @Post('create/player')
  public async createPlayerProfile(
    @Body() data: CreatePlayerAndProfileDto,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return await this.profileService.createPlayerProfile(currentMembership, data.playerProfile, data.profile);
  }

  @Post('create/coach')
  public async createCoachProfile(
    @Body() data: CreateCoachAndProfileDto,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return await this.profileService.createCoachProfile(currentMembership, data.coachProfile, data.profile);
  }
}
