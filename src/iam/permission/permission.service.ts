import { BadRequestException, Injectable } from '@nestjs/common';
import { ENAuditCategory, ENMembershipStatus, Membership } from '@prisma/client';
import { ResourceNotFoundException } from '@common/exceptions/resource-not-found';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AuditLogsService } from '@infrastructure/audit-logs/audit-logs.service';
import { TActiveMembershipPayload } from '@common/guards/active-membership.guard';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService
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
      }
    });

    const result = await this.prisma.membershipPermission.createMany({
      data: membershipPermissionsData,
      skipDuplicates: true,
    });

    await this.auditLogsService.createLog({
      category: ENAuditCategory.AUTH,
      action: 'syncPermission',
      entityType: 'role',
      metadata: { rolePermissionsToSync },
      createdBy: (adminMembership as TActiveMembershipPayload)?.person?.user?.id,
    });

    return {
      syncedCount: result.count,
      message: "Role permissions synced successfully.",
    };
  }

  public async grantDirectPermission(
    targetMembershipId: string,
    permissionCode: string,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) 
      throw new ResourceNotFoundException(`Permission '${permissionCode}' not found`, 'Permission');

    return this.prisma.membershipPermission.upsert({
      where: {
        membershipId_permissionId: {
          membershipId: targetMembershipId,
          permissionId: permission.id,
        }
      },
      create: {
        membershipId: targetMembershipId,
        permissionId: permission.id,
      },
      update: {}
    });
  }

  public async revokeDirectPermission(
    targetMembershipId: string,
    permissionCode: string,
    user_id: string,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) 
      throw new ResourceNotFoundException(`Permission '${permissionCode}' not found`, 'Permission');

    await this.prisma.$transaction(async(tx) => {
      await tx.membershipPermission.delete({
        where: {
          membershipId_permissionId: {
            membershipId: targetMembershipId,
            permissionId: permission.id,
          }
        }
      });

      await this.auditLogsService.createLog({
        category: ENAuditCategory.AUTH,
        action: 'revokePermission',
        entityType: 'permission',
        metadata: { permissionCode },
        createdBy: user_id
      });
    });

    return {}
  }
}

