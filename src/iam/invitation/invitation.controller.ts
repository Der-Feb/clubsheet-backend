import { Body, Controller, Post } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AcceptInvitationDto } from '../membership/membership.dto';

@Controller('invitation')
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) {}

    @Post('accept')
    async acceptInvitation(
        @Body() acceptData: AcceptInvitationDto,
    ) {
        return this.invitationService.acceptInvitation(acceptData);
    }
}
