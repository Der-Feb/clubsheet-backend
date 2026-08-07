import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ClubService } from './club.service';
import { PassportJwtGuard } from '../common/guards/passport.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CreateClubDto, UpdateClubDto } from './club.dto';
import { CurrentUser } from '../common/decorators/current-user';
import { TPayload } from '../auth/auth.types';

@Controller('club')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard)
export class ClubController {
  constructor(private clubService: ClubService) {}

  @Post('register')
  @RequirePermissions(true, ['CLUB_WRITE'])
  public async createClub(
    @Body() createClubDto: CreateClubDto,
    @CurrentUser() currentUser: any
  ) {
    return await this.clubService.createClub(createClubDto, currentUser.user_id);
  }

  @Put('update')
  @RequirePermissions(true, ['CLUB_WRITE'])
  public async updateClub(
    @Body() updateClubDto: UpdateClubDto,
    @CurrentUser() currentUser: any
  ) {
    return await this.clubService.updateClub(updateClubDto, currentUser.user_id, currentUser.person_id);
  }
}
