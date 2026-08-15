import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ENMembershipStatus, Prisma } from "@prisma/client";

export type ActiveMembershipPayload = Prisma.MembershipGetPayload<{
  include: {
    permissions: { include: { permission: true } };
    club: true;
  };
}>;

declare global {
  namespace Express {
    interface Request {
      activeMembership?: ActiveMembershipPayload;
    }
  }
}

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

        const activeMembership = await this.prisma.membership.findFirst({
          where: {
            personId, 
            clubId,
            status: ENMembershipStatus.ACTIVE,
          },
          include: {
            permissions: { include: { permission: true } },
            club: true
          }
        });

        if (!activeMembership)
          throw new UnauthorizedException("Active club membership not found.");

        req.activeMembership = activeMembership;

        return true;
    }

  private getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}