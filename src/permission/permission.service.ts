import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ENMembershipStatus, ENPermissionScope, Membership } from '@prisma/client';
import { ResourceNotFoundException } from '@common/exceptions/resource-not-found';

@Injectable()
export class PermissionService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

  private async membershipAllData(membershipId: string) {
    return await this.prisma.membership.findUnique({
      where: {
        id: membershipId,
        status: ENMembershipStatus.ACTIVE,
      },
      include: {
        permissions: { include: { permission: true } }
      }
    });
  }

  public async SyncMembershipWithRolePermissions(
    membershipId: string,
    adminMembership: Membership
  ) {
    const membership = await this.membershipAllData(membershipId);
    if (!membership) 
      throw new ResourceNotFoundException("Membership not found", "Membership");

    if (!adminMembership || adminMembership.clubId !== membership.clubId)
      throw new BadRequestException("Admin membership not found or not in the same club");

    // fetch the permissions on the roles of the member
    const rolePermissionsToSync = await this.prisma.rolePermission.findMany({
      where: {
        role: {
          memberships: { some: { id: membershipId } }
        },
      },
    });

    if (rolePermissionsToSync.length === 0) {
      return {
        syncedCount: 0,
        message: "No role permissions found to sync.",
      };
    }

    const membershipPermissionsData = rolePermissionsToSync.map((rolePermission) => {
      return {
        membershipId: membershipId,
        permissionId: rolePermission.permissionId,
        scope: rolePermission.scope,
      }
    });

    const result = await this.prisma.membershipPermission.createMany({
      data: membershipPermissionsData,
      skipDuplicates: true,
    });

    return {
      syncedCount: result.count,
      message: "Role permissions synced successfully.",
    };
  }

  public async grantDirectPermission(
    targetMembershipId: string,
    permissionCode: string,
    scope: ENPermissionScope = ENPermissionScope.CLUB,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) 
      throw new ResourceNotFoundException(`Permission '${permissionCode}' not found`, 'Permission');

    return this.prisma.membershipPermission.upsert({
      where: {
        membershipId_permissionId_scope: {
          membershipId: targetMembershipId,
          permissionId: permission.id,
          scope,
        }
      },
      create: {
        membershipId: targetMembershipId,
        permissionId: permission.id,
        scope,
      },
      update: { scope }
    });
  }

  public async revokeDirectPermission(
    targetMembershipId: string,
    permissionCode: string,
    scope: ENPermissionScope = ENPermissionScope.CLUB,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) 
      throw new ResourceNotFoundException(`Permission '${permissionCode}' not found`, 'Permission');

    return this.prisma.membershipPermission.delete({
      where: {
        membershipId_permissionId_scope: {
          membershipId: targetMembershipId,
          permissionId: permission.id,
          scope,
        }
      }
    });
  }
}

