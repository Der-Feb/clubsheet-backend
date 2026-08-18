import { Controller, Get, Req, Post, UseGuards, Body, Put, Param } from '@nestjs/common';
import { ActiveMembershipGuard, TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { MembershipService } from './membership.service';
import { Request } from 'express';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CreateMembershipDto } from './membership.dto';
import { CurrentMembership, CurrentUser } from '@common/decorators/current-user';
import { IsCuid2 } from '@common/validators/is-cuid.validator';
import { TUserJWTPayload } from '../auth/strategy/jwt.strategy';
import { ParseCuidPipe } from '@common/pipes/cuid-pipe';

@Controller('membership')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('my')
  public async getMyMemberships(@Req() req: Request) {
    return req.activeMembership;
  }

  @Post('create')
  @RequirePermissions(true, ['MEMBERSHIP_WRITE'])
  public async createMembership(
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
    @Body() data: CreateMembershipDto,
  ) {
    return await this.membershipService.createMembership(data.personId, currentMembership.clubId, data.type);
  }

  @Put('suspend/:membershipId')
  @RequirePermissions(true, ['MEMBERSHIP_SUSPEND'])
  public async suspendMembership(
    @Param('membershipId', ParseCuidPipe) membershipId: string,
    @CurrentUser() currentUser: TUserJWTPayload,
  ) {
    return await this.membershipService.suspendMembership(membershipId, currentUser.user_id);
  }
}
