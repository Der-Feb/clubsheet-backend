import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AcceptInvitationDto, InviteUserDto } from '../membership/membership.dto';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { ActiveMembershipGuard } from '@common/guards/active-membership.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user';
import { TUserJWTPayload } from '../auth/strategy/jwt.strategy';

@Controller('invitation')
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) {}

    @Post('send')
    @UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard, PermissionsGuard)
    @RequirePermissions(true, ['MEMBERSHIP_WRITE'])
    async sendInvitation(
        @CurrentUser() currentUser: TUserJWTPayload,
        @Body() inviteData: InviteUserDto,
    ) {
        return this.invitationService.inviteUser(currentUser, inviteData);
    }

    @Post('accept')
    async acceptInvitation(
        @Body() acceptData: AcceptInvitationDto,
    ) {
        return this.invitationService.acceptInvitation(acceptData);
    }
}
