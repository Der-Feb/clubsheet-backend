import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClubService } from './club.service';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CreateClubDto, UpdateClubDto } from './club.dto';
import { CurrentMembership, CurrentUser } from '@common/decorators/current-user';
import { TPayload } from '@iam/auth/auth.types';
import { Request } from 'express';
import { ActiveMembershipGuard, TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { TUserJWTPayload } from '@iam/auth/strategy/jwt.strategy';

@Controller('club')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard)
export class ClubController {
  constructor(private clubService: ClubService) {}

  @Get('my')
  @UseGuards(ActiveMembershipGuard)
  async getMyClubs(@Req() req: Request) {
    return req.activeMembership?.club;
  }

  @Post('register')
  public async createClub(
    @Body() createClubDto: CreateClubDto,
    @CurrentUser() currentUser: any,
  ) {
    return await this.clubService.createClub(
      createClubDto,
      currentUser.user_id,
    );
  }

  @Put('update')
  @UseGuards(ActiveMembershipGuard)
  @RequirePermissions(true, ['CLUB_WRITE'])
  public async updateClub(
    @Body() updateClubDto: UpdateClubDto,
    @CurrentMembership() currentMembership: TActiveMembershipPayload
  ) {
    return await this.clubService.updateClub(
      updateClubDto,
      currentMembership
    );
  }

}
