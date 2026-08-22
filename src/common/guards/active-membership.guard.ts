import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "@infrastructure/prisma/prisma.service";
import { ENMembershipPermissionAction, ENMembershipStatus, Prisma } from "@prisma/client";

export type TActiveMembershipPayload = Prisma.MembershipGetPayload<{
  include: {
    permissions: { include: { permission: true } };
    club: true;
    person: { include: { user: true } },
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    },
  };
}>;

declare global {
  namespace Express {
    interface Request {
      activeMembership?: TActiveMembershipPayload;
      effectivePermissions?: string[];
    }
  }
}

@Injectable()
export class ActiveMembershipGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext) {
        const req = this.getRequest(context);

        const personId = req.user?.person_id;
        const userId = req.user?.user_id;
        if (!personId || !userId)
          throw new UnauthorizedException("User session not found.");
        
        const clubId = req.headers['x-club-id'] as string;
        if (!clubId)
          throw new UnauthorizedException("Club ID not provided.");

        let activeMembership: null | TActiveMembershipPayload = null;

        try {          
          activeMembership = await this.prisma.membership.findFirst({
            where: {
              personId, 
              clubId,
              status: ENMembershipStatus.ACTIVE,
            },
            include: {
              permissions: { include: { permission: true } },
              club: true,
              person: { include: { user: true } },
              roles: {
                include: {
                  role: {
                    include: {
                      permissions: {
                        include: {
                          permission: true
                        }
                      }
                    }
                  }
                }
              },
            }
          });
        } catch (error) {
          throw new InternalServerErrorException("Validating user failed")
        }

        if (!activeMembership)
          throw new UnauthorizedException("Active club membership not found.");

        const rolePermissions = new Set<string>();
        for (const membershipRole of activeMembership.roles) {
          for (const rolePerm of membershipRole.role.permissions) {
            rolePermissions.add(rolePerm.permission.code);
          }
        }

        const explicitGrants = new Set<string>();
        const explicitDenies = new Set<string>();

        for (const override of activeMembership.permissions) {
          if (override.action === ENMembershipPermissionAction.GRANT) {
            explicitGrants.add(override.permission.code);
          } else if (override.action === ENMembershipPermissionAction.REVOKE) {
            explicitDenies.add(override.permission.code);
          }
        }

        const effectivePermissions = Array.from(rolePermissions)
          .concat(Array.from(explicitGrants))
          .filter((code) => !explicitDenies.has(code));

        console.log(effectivePermissions);

        req.effectivePermissions = effectivePermissions;
        req.activeMembership = activeMembership;

        return true;
    }

  private getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}