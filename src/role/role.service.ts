import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { TActiveMembershipPayload } from '@common/guards/active-membership.guard';
import { parsePrismaError } from '@common/utils/error-handler';
import { ENAuditCategory, Prisma } from '@prisma/client';
import { ResourceNotFoundException } from '@common/exceptions/resource-not-found';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { UpdateClubDto } from '../club/club.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  public async getRolesInClub(clubId: string) {
    return await this.prisma.role.findMany({
      where: {
        OR: [
          { isSystem: true },
          { clubId, isSystem: false },
        ]
      }
    });
  }

  public async getRole(role_id: string, clubId: string, membershipId: string) {
    const role = await this.prisma.role.findUnique({ 
      where: { id: role_id },
    });

    if (!role) 
      throw new ResourceNotFoundException('Role not found', 'role');

    if (!role.isSystem)
      if (role.clubId !== clubId)
        throw new BadRequestException('Role does not belong to the club');

    const membershipRole = await this.prisma.membershipRole.findUnique({
      where: {
        membershipId_roleId: {
          membershipId, roleId: role_id
        }
      }
    });
    
    if (!membershipRole)
      throw new BadRequestException('Role is not assigned to you');
      
    return {...role, ...membershipRole};
  }

  public async updatedClubRole(role_id: string, data: UpdateRoleDto, clubId: string, user_id: string) {
    const { name, description } = data;
    const role = await this.prisma.role.findUnique({ where: { id: role_id } });
    if (!role) 
      throw new ResourceNotFoundException('Role not found', 'role');

    if (!role.isSystem)
      if (role.clubId !== clubId)
        throw new BadRequestException('Role does not belong to the club');

    const updatedRole = await this.prisma.role.update({
      where: { id: role_id },
      data: { name, description },
    });

    await this.auditLogsService.createLog({
      category: ENAuditCategory.AUTH,
      action: "updateRole",
      entityType: "Role",
      metadata: { roleId: role_id },
      createdBy: user_id
    });

    return updatedRole;
  }

  public async assignRole(adminMembership: TActiveMembershipPayload, targetMembershipId: string, roleCode: string, user_id: string) {
    const targetMembership = await this.prisma.membership.findUnique({ where: { id: targetMembershipId } });
    if (!targetMembership) 
      throw new ResourceNotFoundException('Target membership not found', 'membership');

    const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) 
      throw new ResourceNotFoundException('Role not found', 'role');

    if (!role.isSystem)
      if (role.clubId !== adminMembership.clubId)
        throw new BadRequestException('Role does not belong to the club');

    try {
      await this.prisma.$transaction(async(tx) => {
        await tx.membership.update({
          where: { id: targetMembershipId },
          data: { roles: { connect: { id: role.id } } },
        });

        await this.auditLogsService.createLog({
          category: ENAuditCategory.AUTH,
          action: "assignRole",
          entityType: "Role, Membership",
          metadata: {
            roleCode, 
            targetMembershipId, 
            adminMembershipId: adminMembership.id
          },
          createdBy: user_id
        }, tx);
      });
    } catch (error) {
      throw new InternalServerErrorException(parsePrismaError(error))
    }
  }

  public async revokeRole(adminMembership: TActiveMembershipPayload, targetMembershipId: string, roleCode: string, user_id: string) {
    // user_id is for the admin
    const targetMembership = await this.prisma.membership.findUnique({ where: { id: targetMembershipId } });
    if (!targetMembership) 
      throw new ResourceNotFoundException('Target membership not found', 'membership');

    const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) 
      throw new ResourceNotFoundException('Role not found', 'role');

    if (!role.isSystem)
      if (role.clubId !== adminMembership.clubId)
        throw new BadRequestException('Role does not belong to the club');

    try {
      await this.prisma.$transaction(async(tx) => {
        await tx.membership.update({
          where: { id: targetMembershipId },
          data: { roles: { disconnect: { id: role.id } } },
        });

        await this.auditLogsService.createLog({
          category: ENAuditCategory.AUTH,
          action: "revokeRole",
          entityType: "Role, Membership",
          metadata: {
            roleCode, 
            targetMembershipId, 
            adminMembershipId: adminMembership.id
          },
          createdBy: user_id
        }, tx);
      });
    } catch (error) {
      throw new InternalServerErrorException(parsePrismaError(error))
    }
  }

  public async createRole(data: CreateRoleDto, clubId: string, user_id: string) {
    const { roleCode, name, description } = data;
    const existingRole = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (existingRole) 
      throw new BadRequestException('Role with same code already exists');

    const role = await this.prisma.role.create({
      data: {
        code: roleCode, 
        name, clubId,
        description,
        isSystem: false,
      },
    });

    await this.auditLogsService.createLog({
      category: ENAuditCategory.AUTH,
      action: "createRole",
      entityType: "Role",
      metadata: { roleCode, clubId },
      createdBy: user_id
    });

    return role;
  }

  public async deleteRole(roleId: string, clubId: string, user_id: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) 
      throw new ResourceNotFoundException('Role not found', 'role');

    if (role.isSystem)
      throw new BadRequestException('System roles cannot be deleted');

    if (role.clubId !== clubId)
      throw new BadRequestException('Role does not belong to the club');
    
    await this.prisma.role.delete({ where: { id: roleId } });

    await this.auditLogsService.createLog({
      category: ENAuditCategory.AUTH,
      action: "deleteRole",
      entityType: "Role",
      metadata: { roleId, clubId },
      createdBy: user_id
    });

    return role;
  }
}
