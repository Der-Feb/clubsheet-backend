import { Reflector } from '@nestjs/core';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ENClubFeatureStatus, ENFeature } from '@prisma/client';
import { REQUIRED_FEATURE_KEY } from '@common/decorators/require-feature.decorator';
import { getRequestFromContext } from '@common/utils/request-context.util';

declare global {
  namespace Express {
    interface Request {
      clubFeatures?: ENFeature[];
    }
  }
}

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly Prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredFeatures = this.reflector.getAllAndOverride<ENFeature[]>(
      REQUIRED_FEATURE_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!requiredFeatures || requiredFeatures.length === 0) return true;

    const req = getRequestFromContext(ctx);
    const clubId = req.activeMembership?.clubId;
    if (!clubId) {
      throw new UnauthorizedException(
        'FeatureGuard requires ActiveMembershipGuard to run first.',
      );
    }

    let enabledFeatures: Set<ENFeature>;

    try {
      const rows = await this.Prisma.clubFeature.findMany({
        where: {
          clubId,
          status: ENClubFeatureStatus.ENABLED,
          feature: { code: { in: requiredFeatures }, isActive: true },
        },
        select: { feature: { select: { code: true } } },
      });

      enabledFeatures = new Set(rows.map((r) => r.feature.code));
    } catch (error) {
      throw new InternalServerErrorException('Validating club features failed');
    }

    const missing = requiredFeatures.filter((f) => !enabledFeatures.has(f));

    if (missing.length > 0) {
      throw new ForbiddenException(
        `Feature(s) not enabled for this club: ${missing.join(', ')}`,
      );
    }

    req.clubFeatures = Array.from(enabledFeatures);

    return true;
  }
}
