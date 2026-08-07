import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PassportJwtGuard } from '../common/guards/passport.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import { MembershipService } from './membership.service';
import { CurrentUser } from '../common/decorators/current-user';

@Controller('membership')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard)
export class MembershipController {
    constructor(
        private readonly membershipService: MembershipService,
    ) {}

    @Post('suspend/:club_id')
    public async suspendClub(
        @Param('club_id') clubId: string,
        @CurrentUser() user: any,
    ) {
        await this.membershipService.revokeActiveMembershipOfClub(user.user_id, user.person_id, clubId);

        return {
            success: true,
            message: 'Club suspended successfully',
        };
    }
}
