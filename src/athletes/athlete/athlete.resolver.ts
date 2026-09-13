import { Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { Athlete } from '@generated/prisma-nestjs-graphql/athlete/athlete.model';
import { PassportJwtGuard } from '@common/guards/passport.guard';
import { EmailVerifiedGuard } from '@common/guards/email-verified.guard';
import { ActiveMembershipGuard } from '@common/guards/active-membership.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';

@Resolver(() => Athlete)
@UseGuards(
  PassportJwtGuard,
  EmailVerifiedGuard,
  ActiveMembershipGuard,
  PermissionsGuard,
)
export class AthleteResolver {
  constructor(private readonly athleteService: AthleteService) {}
}
