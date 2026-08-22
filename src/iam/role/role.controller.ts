import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { Request } from 'express';
import { ParseCuidPipe } from '@common/pipes/cuid-pipe';
import { AssignRoleDto, CreateRoleDto, UpdateRoleDto } from './role.dto';
import { CurrentMembership, CurrentUser } from '@common/decorators/current-user';
import { ActiveMembershipGuard, TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { TUserJWTPayload } from '../auth/strategy/jwt.strategy';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '@common/guards/permissions.guard';

@Controller('role')
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard, PermissionsGuard)
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get('my')
  public async getRoles(@Req() req: Request) {
    return req.activeMembership?.roles;
  }

  @Get('club')
  @RequirePermissions(true, ["ROLE_READ"])
  public async getClubRoles(@Req() req: Request) {
    return await this.roleService.getRolesInClub(req.activeMembership?.clubId!);
  }

  @Get('/:role_id')
  public async getRole(
    @Param('role_id', ParseCuidPipe) role_id: string,
    @CurrentMembership() membership: TActiveMembershipPayload,
  ) {
    return await this.roleService.getRole(role_id, membership.clubId, membership.id);
  }

  @Post()
  @RequirePermissions(true, ["ROLE_WRITE"])
  public async createRole(
    @Body() data: CreateRoleDto,
    @CurrentMembership() adminMembership: TActiveMembershipPayload,
    @CurrentUser() user: TUserJWTPayload,
  ) {
    return await this.roleService.createRole(data, adminMembership.clubId!, user.user_id);
  }

  @Delete(':role_id')
  @RequirePermissions(true, ["ROLE_DELETE"])
  public async deleteRole(
    @Param('role_id', ParseCuidPipe) role_id: string,
    @CurrentMembership() membership: TActiveMembershipPayload,
    @CurrentUser() user: TUserJWTPayload
  ) {
    return await this.roleService.deleteRole(role_id, membership.clubId, user.user_id);
  }

  @Patch(':role_id')
  @RequirePermissions(true, ["ROLE_WRITE"])
  public async updateRole(
    @Param('role_id', ParseCuidPipe) role_id: string,
    @Body() data: UpdateRoleDto,
    @CurrentMembership() membership: TActiveMembershipPayload,
    @CurrentUser() user: TUserJWTPayload
  ) {
    return await this.roleService.updatedClubRole(role_id, data, membership.clubId, user.user_id);
  }

  @Post('assign/:membership_id')
  @RequirePermissions(true, ["ROLE_ASSIGN"])
  public async assignRole(
    @CurrentMembership() adminMembership: TActiveMembershipPayload,
    @CurrentUser() user: TUserJWTPayload,
    @Param('membership_id', ParseCuidPipe) membership_id: string,
    @Body() data: AssignRoleDto,
  ) {
    return await this.roleService.assignRole(adminMembership, membership_id, data.roleCode, user.user_id);
  }

  @Post('revoke/:membership_id')
  @RequirePermissions(true, ["ROLE_REVOKE"])
  public async revokeRole(
    @CurrentMembership() adminMembership: TActiveMembershipPayload,
    @CurrentUser() user: TUserJWTPayload,
    @Param('membership_id', ParseCuidPipe) membership_id: string,
    @Body() data: AssignRoleDto,
  ) {
    return await this.roleService.revokeRole(adminMembership, membership_id, data.roleCode, user.user_id);
  }
}
