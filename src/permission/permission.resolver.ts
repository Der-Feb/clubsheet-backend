import { Resolver } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionService } from './permission.service';
import { UseGuards } from '@nestjs/common';
import { PassportJwtGuard } from 'src/common/guards/passport.guard';
import { EmailVerifiedGuard } from 'src/common/guards/email-verified.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { ActiveMembershipGuard } from '@common/guards/active-membership.guard';

@Resolver()
@UseGuards(PassportJwtGuard, EmailVerifiedGuard, ActiveMembershipGuard)
export class PermissionResolver {
    constructor(
        private readonly permissionService: PermissionService
    ) {}

    @RequirePermissions(true, ["PERMISSION_ASSIGN", "PERMISSION_READ"])
    public async SyncMembershipWithRolePermissions() {}
}
