import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ENMembershipStatus } from "@prisma/client";
import { GqlExecutionContext } from "@nestjs/graphql";

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
            assignedRoles: true,
            permissions: {
                include: { permission: true }
            },
          }
        });

        if (!activeMembership)
          throw new UnauthorizedException("Active club membership not found.");

        req.activeMembership = activeMembership;

        return true;
    }

    private getRequest(context: ExecutionContext) {
        if (context.getType().toString() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context);
            return gqlContext.getContext().req;
        }

        return context.switchToHttp().getRequest();
    }
}