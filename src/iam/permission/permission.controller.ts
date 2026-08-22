import { Controller, Get, Post, Req, UseGuards, Body, Param } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Request } from 'express';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { ActiveMembershipGuard, TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { GrantPermissionDto, RevokePermissionDto } from './permission.dto';
import { CurrentMembership, CurrentUser } from '@common/decorators/current-user';
import { TUserJWTPayload } from '../auth/strategy/jwt.strategy';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '@common/guards/permissions.guard';

@Controller('permission')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('my')
  public getMyPermissions(@Req() req: Request) {
    return req.activeMembership?.permissions || [];
  }

  @Post('grant/:membershipId')
  @RequirePermissions(true, ["PERMISSION_ASSIGN"])
  public async grantPermission(
    @Param('membershipId') targetMembershipId: string,
    @Body() dto: GrantPermissionDto,
  ) {
    return await this.permissionService.grantDirectPermission(
      targetMembershipId,
      dto.permissionCode,
    );
  }

  @Post('sync/:membershipId')
  @RequirePermissions(true, ["PERMISSION_ASSIGN"])
  public async SyncMembershipWithRolePermissions(
    @Param('membershipId') targetMembershipId: string,
    @CurrentMembership() currentMembership: TActiveMembershipPayload,
  ) {
    return await this.permissionService.SyncMembershipWithRolePermissions(
      targetMembershipId,
      currentMembership, // for the admin, one who assign
    );
  }

  @Post('revoke/:membershipId')
  @RequirePermissions(true, ["PERMISSION_REVOKE"])
  public async revokePermission(
    @Param('membershipId') targetMembershipId: string,
    @Body() dto: RevokePermissionDto,
    @CurrentUser() currentUser: TUserJWTPayload,
  ) {
    return await this.permissionService.revokeDirectPermission(
      targetMembershipId,
      dto.permissionCode,
      currentUser.user_id,
    );
  }
}
